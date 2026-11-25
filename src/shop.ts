import type { Roastery } from "./roasteries.ts";

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
  /\b(mug|tumbler|bottle|grinder|kettle|dripper|filter papers?|filters|subscriptions?|gift|apparel|t-?shirt|hoodie|hat|tote|scale|cups?|server|brewer|machine|bundle|card|merch|tea|matcha|hojicha|chocolate|test product|cafe only)\b/i;

const UNIT_GRAMS: Record<string, number> = { g: 1, kg: 1000, lb: 453.6, lbs: 453.6, oz: 28.35 };

export function parseWeightGrams(text: string): number | undefined {
  const match = /(?:(\d+)\s*[x×]\s*)?(\d+(?:\.\d+)?)\s*(kg|g|lbs?|oz)\b/i.exec(text);
  if (!match?.[2] || !match[3]) return undefined;
  const factor = UNIT_GRAMS[match[3].toLowerCase()];
  const count = match[1] ? Number(match[1]) : 1;
  return factor === undefined ? undefined : Math.round(count * Number(match[2]) * factor);
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function toBeans(feed: unknown, roastery: Roastery, currency: string): Bean[] {
  const products = asRecord(feed).products;
  if (!Array.isArray(products)) throw new Error(`${roastery.shop}: feed has no products array`);
  const beans: Bean[] = [];
  for (const item of products) {
    const product = asRecord(item);
    const title = asString(product.title);
    if (NOT_COFFEE.test(`${title} ${asString(product.product_type)} ${asString(product.handle).replaceAll("-", " ")}`)) continue;
    const variants = (Array.isArray(product.variants) ? product.variants : []).map(asRecord);
    const bags = variants
      .map((v) => ({ grams: parseWeightGrams(asString(v.title)), price: Number(v.price), available: v.available === true }))
      .filter((b): b is { grams: number; price: number; available: boolean } => b.grams !== undefined && b.price > 0)
      .sort((a, b) => a.grams - b.grams);
    const smallest = bags[0];
    if (!smallest) continue;
    beans.push({
      roasteryId: roastery.id,
      roasteryName: roastery.name,
      title,
      url: `https://${roastery.shop}/products/${asString(product.handle)}`,
      publishedAt: asString(product.published_at),
      available: bags.some((b) => b.available),
      currency,
      price: smallest.price,
      grams: smallest.grams,
      pricePer100g: Math.round((smallest.price / smallest.grams) * 10000) / 100,
    });
  }
  return beans;
}

async function getJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: { "User-Agent": "roastery-tracker/0.1 (personal use)" },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.json();
}

export async function fetchBeans(roastery: Roastery): Promise<Bean[]> {
  if (!roastery.shop) throw new Error(`${roastery.name} has no shop feed`);
  const base = `https://${roastery.shop}`;
  const [meta, feed] = await Promise.all([getJson(`${base}/meta.json`), getJson(`${base}/products.json?limit=250`)]);
  return toBeans(feed, roastery, asString(asRecord(meta).currency) || "?");
}
