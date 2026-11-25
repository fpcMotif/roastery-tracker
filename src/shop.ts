import type { Feed, Roastery } from "./roasteries.ts";

export type Bean = {
  roasteryId: string;
  roasteryName: string;
  title: string;
  url: string;
  publishedAt: string;
  available: boolean;
  currency: string;
  price: number;
  grams: number;
  pricePer100g: number;
};

const NOT_COFFEE =
  /\b(mug|tumbler|bottle|grinder|kettle|dripper|filter papers?|filters|subscriptions?|gift|apparel|t-?shirt|hoodie|hat|tote|scale|cups?|server|brewer|machine|bundle|card|merch|tea|matcha|hojicha|chocolate|test product|cafe only|drip ?bags?|capsules?|cupping|training|workshop|instant)\b/i;
const NOT_COFFEE_CJK = /드립백|캡슐|구독|정기|\d+\s*개월|인스턴트|머그|텀블러|굿즈|선물|기프트|세트|도서|ドリップバッグ|ギフト|セット|定期便|カプセル|インスタント/;

const UNIT_GRAMS: Record<string, number> = { g: 1, gr: 1, gram: 1, grams: 1, kg: 1000, lb: 453.6, lbs: 453.6, oz: 28.35 };

export function parseWeightGrams(text: string): number | undefined {
  const match = /(?:(\d+)\s*[x×]\s*)?(\d+(?:\.\d+)?)\s*(kg|grams?|gr|g|lbs?|oz)(?![a-z])/i.exec(text);
  if (!match?.[2] || !match[3]) return undefined;
  const factor = UNIT_GRAMS[match[3].toLowerCase()];
  const count = match[1] ? Number(match[1]) : 1;
  return factor === undefined ? undefined : Math.round(count * Number(match[2]) * factor);
}

function isNotCoffee(text: string): boolean {
  return NOT_COFFEE.test(text) || NOT_COFFEE_CJK.test(text);
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function bean(roastery: Roastery, fields: Omit<Bean, "roasteryId" | "roasteryName" | "pricePer100g">): Bean {
  return {
    roasteryId: roastery.id,
    roasteryName: roastery.name,
    ...fields,
    pricePer100g: Math.round((fields.price / fields.grams) * 10000) / 100,
  };
}

export function toBeans(feed: unknown, roastery: Roastery, domain: string, currency: string): Bean[] {
  const products = asRecord(feed).products;
  if (!Array.isArray(products)) throw new Error(`${domain}: feed has no products array`);
  const beans: Bean[] = [];
  for (const item of products) {
    const product = asRecord(item);
    const title = asString(product.title);
    if (isNotCoffee(`${title} ${asString(product.product_type)} ${asString(product.handle).replaceAll("-", " ")}`)) continue;
    const variants = (Array.isArray(product.variants) ? product.variants : []).map(asRecord);
    const bags = variants
      .map((v) => ({
        grams: parseWeightGrams(asString(v.title)) ?? parseWeightGrams(title),
        price: Number(v.price),
        available: v.available === true,
      }))
      .filter((b): b is { grams: number; price: number; available: boolean } => b.grams !== undefined && b.price > 0)
      .sort((a, b) => a.grams - b.grams);
    const smallest = bags[0];
    if (!smallest) continue;
    beans.push(
      bean(roastery, {
        title,
        url: `https://${domain}/products/${asString(product.handle)}`,
        publishedAt: asString(product.published_at),
        available: bags.some((b) => b.available),
        currency,
        price: smallest.price,
        grams: smallest.grams,
      }),
    );
  }
  return beans;
}

function decodeEntities(text: string): string {
  return text
    .replace(/<[^>]+>/g, "")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(Number.parseInt(code, 16)))
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .trim();
}

export function toWooBeans(items: unknown, roastery: Roastery): Bean[] {
  if (!Array.isArray(items)) throw new Error(`${roastery.name}: store API did not return a list`);
  const beans: Bean[] = [];
  for (const item of items.map(asRecord)) {
    const title = decodeEntities(asString(item.name));
    const categories = (Array.isArray(item.categories) ? item.categories : []).map((c) => decodeEntities(asString(asRecord(c).name)));
    if (!categories.some((c) => /coffee/i.test(c)) || isNotCoffee(`${title} ${categories.join(" ")}`)) continue;
    const terms = (Array.isArray(item.attributes) ? item.attributes : [])
      .flatMap((a) => (Array.isArray(asRecord(a).terms) ? (asRecord(a).terms as unknown[]) : []))
      .map((t) => asString(asRecord(t).name));
    const grams = [title, ...terms].map(parseWeightGrams).filter((g): g is number => g !== undefined).sort((a, b) => a - b)[0];
    const prices = asRecord(item.prices);
    const minor = 10 ** Number(prices.currency_minor_unit ?? 2);
    const price = Number(asString(asRecord(prices.price_range).min_amount) || asString(prices.price)) / minor;
    if (!grams || !(price > 0)) continue;
    beans.push(
      bean(roastery, {
        title,
        url: asString(item.permalink),
        publishedAt: "",
        available: item.is_in_stock === true,
        currency: asString(prices.currency_code),
        price,
        grams,
      }),
    );
  }
  return beans;
}

function metaContent(html: string, property: string): string | undefined {
  const tag = new RegExp(`<meta[^>]+(?:property|name)=["']${property.replaceAll(":", "\\:")}["'][^>]*>`, "i").exec(html)?.[0];
  return tag ? /content=["']([^"']*)["']/i.exec(tag)?.[1] : undefined;
}

function jsonLdNodes(html: string): Record<string, unknown>[] {
  const nodes: Record<string, unknown>[] = [];
  const visit = (value: unknown): void => {
    if (Array.isArray(value)) return value.forEach(visit);
    const node = asRecord(value);
    if (Object.keys(node).length === 0) return;
    nodes.push(node);
    if (node["@graph"]) visit(node["@graph"]);
    if (node.hasVariant) visit(node.hasVariant);
  };
  for (const match of html.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      visit(JSON.parse(match[1] ?? ""));
    } catch {
      continue;
    }
  }
  return nodes;
}

export type PageProduct = { title: string; price: number; currency: string; available: boolean; grams?: number };

export function parseProductPage(html: string, fallbackCurrency: string): PageProduct | undefined {
  const products = jsonLdNodes(html).filter((n) => /Product/.test(asString(n["@type"])));
  const offers = products.flatMap((p) => (Array.isArray(p.offers) ? p.offers : [p.offers]).map(asRecord));
  const ldPrices = offers.map((o) => Number(o.lowPrice ?? o.price)).filter((p) => p > 0);
  const ogPrice = Number(metaContent(html, "product:sale_price:amount") ?? metaContent(html, "product:price:amount"));
  const price = ogPrice > 0 ? ogPrice : Math.min(...ldPrices);
  if (!Number.isFinite(price) || price <= 0) return undefined;
  const title = decodeEntities(
    asString(products[0]?.name) || metaContent(html, "og:title") || (/<title>([^<]*)/i.exec(html)?.[1] ?? ""),
  );
  const availability = offers.map((o) => asString(o.availability)).join(" ") || (metaContent(html, "product:availability") ?? "");
  const description = `${asString(products[0]?.description)} ${metaContent(html, "og:description") ?? ""} ${metaContent(html, "description") ?? ""}`;
  return {
    title,
    price,
    currency: metaContent(html, "product:price:currency") || asString(offers[0]?.priceCurrency) || fallbackCurrency,
    available: !/OutOfStock|SoldOut|oos/i.test(availability),
    grams: parseWeightGrams(title) ?? parseWeightGrams(decodeEntities(description)) ?? bagSizeInText(html),
  };
}

function bagSizeInText(html: string): number | undefined {
  const text = decodeEntities(html.replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " "));
  const grams = parseWeightGrams(text);
  return grams !== undefined && grams >= 50 && grams <= 2000 ? grams : undefined;
}

export function productLinks(html: string, base: string, product: RegExp): string[] {
  const raw = [...html.matchAll(/(?:href=["']|<loc>\s*)([^"'<\s]+)/gi)].map((m) => decodeEntities(m[1] ?? ""));
  const links = new Set<string>();
  for (const href of raw) {
    let url: URL;
    try {
      url = new URL(href, base);
    } catch {
      continue;
    }
    for (const key of [...url.searchParams.keys()]) {
      if (!/^(product_no|idx|goodsNo|ItemCode)$/i.test(key)) url.searchParams.delete(key);
    }
    url.hash = "";
    const clean = url.href;
    if (product.test(decodeURI(clean)) || product.test(clean)) links.add(clean);
  }
  return [...links];
}

const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36",
  "Accept-Language": "en,ko;q=0.8,ja;q=0.7",
};

async function getText(url: string): Promise<string> {
  const response = await fetch(url, { headers: BROWSER_HEADERS, signal: AbortSignal.timeout(15_000) });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.text();
}

async function getJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: { "User-Agent": "roastery-tracker/0.1 (personal use)" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.json();
}

async function mapLimited<T, R>(items: T[], limit: number, task: (item: T) => Promise<R>): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await task(items[index] as T).then(
        (value) => ({ status: "fulfilled", value }) as const,
        (reason: unknown) => ({ status: "rejected", reason }) as const,
      );
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

const MAX_PAGES = 60;

async function fetchPageBeans(roastery: Roastery, feed: Extract<Feed, { kind: "pages" }>): Promise<Bean[]> {
  const lists = await Promise.all(feed.lists.map(async (list) => productLinks(await getText(list), list, feed.product)));
  const links = [...new Set(lists.flat())].slice(0, MAX_PAGES);
  if (links.length === 0) throw new Error(`${roastery.name}: no product links found on ${feed.lists.join(", ")}`);
  const pages = await mapLimited(links, 4, async (url) => ({ url, product: parseProductPage(await getText(url), feed.currency) }));
  const beans: Bean[] = [];
  for (const page of pages) {
    if (page.status !== "fulfilled") continue;
    const { url, product } = page.value;
    if (!product?.grams || isNotCoffee(product.title)) continue;
    beans.push(
      bean(roastery, {
        title: product.title,
        url,
        publishedAt: "",
        available: product.available,
        currency: product.currency,
        price: product.price,
        grams: product.grams,
      }),
    );
  }
  return beans;
}

export async function fetchBeans(roastery: Roastery): Promise<Bean[]> {
  const feed = roastery.feed;
  if (!feed) throw new Error(`${roastery.name} has no shop feed`);
  if (feed.kind === "shopify") {
    const base = `https://${feed.host}`;
    const [meta, products] = await Promise.all([getJson(`${base}/meta.json`), getJson(`${base}/products.json?limit=250`)]);
    const shop = asRecord(meta);
    return toBeans(products, roastery, asString(shop.domain) || feed.host, asString(shop.currency) || "?");
  }
  if (feed.kind === "woocommerce") {
    return toWooBeans(await getJson(`https://${feed.host}/wp-json/wc/store/v1/products?per_page=100`), roastery);
  }
  return fetchPageBeans(roastery, feed);
}
