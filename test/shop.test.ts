import { describe, expect, test } from "bun:test";
import { parseProductPage, parseWeightGrams, productLinks, toBeans, toWooBeans } from "../src/shop.ts";

const SEY = { id: "sey", name: "SEY Coffee", city: "New York (Brooklyn)", country: "US" as const };
const MANHATTAN = { id: "manhattan", name: "Manhattan Coffee Roasters", city: "Rotterdam", country: "NL" as const };

const feed = {
  products: [
    {
      title: "2026 Banko Gotiti; Second Selection - Ethiopia",
      handle: "2026-banko-gotiti-second-selection-ethiopia",
      product_type: "Coffees",
      published_at: "2026-11-18T21:02:39-05:00",
      variants: [
        { title: "2lb", price: "68.50", available: true },
        { title: "250g", price: "25.00", available: true },
      ],
    },
    {
      title: "Onyx 16oz Aluminum Water Bottle",
      handle: "bottle",
      product_type: "Merch",
      published_at: "2026-11-01T00:00:00Z",
      variants: [{ title: "16oz", price: "30.00", available: true }],
    },
    {
      title: "Old Kenya",
      handle: "old-kenya",
      product_type: "Coffees",
      published_at: "2026-01-02T00:00:00Z",
      variants: [{ title: "250g", price: "22.00", available: false }],
    },
    {
      title: "HOJICHA Roasted Green Tea Powder",
      handle: "hojicha",
      product_type: "",
      published_at: "2026-10-01T00:00:00Z",
      variants: [{ title: "50g", price: "18.70", available: true }],
    },
    {
      title: "Rituals",
      handle: "rituals-subscription",
      product_type: "Coffee",
      published_at: "2026-10-01T00:00:00Z",
      variants: [{ title: "2 x 250g", price: "300.00", available: true }],
    },
    {
      title: "Gift Card",
      handle: "gift-card",
      product_type: "",
      published_at: "2026-01-01T00:00:00Z",
      variants: [{ title: "$50", price: "50.00", available: true }],
    },
  ],
};

describe("parseWeightGrams", () => {
  test("reads grams, kilos, pounds and ounces", () => {
    expect(parseWeightGrams("250g")).toBe(250);
    expect(parseWeightGrams("250 g / Whole Bean")).toBe(250);
    expect(parseWeightGrams("1kg")).toBe(1000);
    expect(parseWeightGrams("2lb")).toBe(907);
    expect(parseWeightGrams("12 oz")).toBe(340);
    expect(parseWeightGrams("Default Title")).toBeUndefined();
  });

  test("reads gr and gram spellings", () => {
    expect(parseWeightGrams("Omni / 250gr")).toBe(250);
    expect(parseWeightGrams("1000 grams")).toBe(1000);
  });

  test("multiplies multi-bag sizes", () => {
    expect(parseWeightGrams("2 x 250g")).toBe(500);
    expect(parseWeightGrams("3×100g")).toBe(300);
  });
});

describe("toBeans", () => {
  const beans = toBeans(feed, SEY, "seycoffee.com", "USD");

  test("keeps coffees and drops merch and gift cards", () => {
    expect(beans.map((b) => b.title)).toEqual(["2026 Banko Gotiti; Second Selection - Ethiopia", "Old Kenya"]);
  });

  test("prices the smallest bag and computes price per 100 g", () => {
    const [banko] = beans;
    expect(banko?.price).toBe(25);
    expect(banko?.grams).toBe(250);
    expect(banko?.pricePer100g).toBe(10);
    expect(banko?.currency).toBe("USD");
    expect(banko?.url).toBe("https://seycoffee.com/products/2026-banko-gotiti-second-selection-ethiopia");
  });

  test("falls back to the bag size in the product title", () => {
    const srw = toBeans(
      { products: [{ title: "Kenya, Kii AA, Kirinyaga, washed, 250g", handle: "kii", product_type: "Coffee", variants: [{ title: "Default Title", price: "275.00", available: true }] }] },
      SEY,
      "srw.no",
      "NOK",
    );
    expect(srw[0]).toMatchObject({ grams: 250, price: 275, pricePer100g: 110 });
  });

  test("marks sold-out coffees", () => {
    expect(beans.find((b) => b.title === "Old Kenya")?.available).toBe(false);
  });

  test("rejects a feed without a products array", () => {
    expect(() => toBeans({}, SEY, "seycoffee.com", "USD")).toThrow();
  });
});

describe("toWooBeans", () => {
  const items = [
    {
      name: "Buena Vista",
      permalink: "https://manhattancoffeeroasters.com/product/coffees/5world-class/buena-vista/",
      prices: { price: "2750", currency_code: "EUR", currency_minor_unit: 2, price_range: { min_amount: "2750", max_amount: "21600" } },
      is_in_stock: true,
      attributes: [
        { name: "Roasted For", terms: [{ name: "Espresso" }, { name: "Filter" }] },
        { name: "Bag size", terms: [{ name: "125g" }, { name: "1kg" }, { name: "250g" }] },
      ],
      categories: [{ name: "Coffees" }, { name: "World Class" }],
    },
    {
      name: "&#8220;Black <s>Friday</s>&#8221; Sunday Cupping &#038; Roastery Tour",
      permalink: "https://manhattancoffeeroasters.com/product/trainings-cuppings/tour/",
      prices: { price: "0", currency_code: "EUR", currency_minor_unit: 2, price_range: null },
      is_in_stock: false,
      attributes: [],
      categories: [{ name: "Trainings &amp; Cuppings" }],
    },
    {
      name: "Fredy Orantes bundle",
      permalink: "https://manhattancoffeeroasters.com/product/bundles/fredy-orantes-bundle/",
      prices: { price: "4228", currency_code: "EUR", currency_minor_unit: 2, price_range: { min_amount: "4228" } },
      is_in_stock: true,
      attributes: [{ name: "Bag size", terms: [{ name: "125g" }] }],
      categories: [{ name: "Bundles" }, { name: "Coffees" }],
    },
  ];

  test("prices the smallest bag in major currency units and skips bundles and events", () => {
    const beans = toWooBeans(items, MANHATTAN);
    expect(beans).toHaveLength(1);
    expect(beans[0]).toMatchObject({ title: "Buena Vista", price: 27.5, grams: 125, pricePer100g: 22, currency: "EUR", available: true, publishedAt: "" });
  });
});

describe("parseProductPage", () => {
  const cafe24 = `<html><head>
    <meta property="og:title" content="프릳츠 원두 올드독 Old Dog" />
    <meta property="product:price:amount" content="17000" />
    <meta property="product:price:currency" content="KRW" />
    <meta property="product:sale_price:amount" content="17000" />
    <script type="application/ld+json">{"@context":"https://schema.org","@type":"ProductGroup","name":"[프릳츠] 올드독 200g",
      "hasVariant":[{"@type":"Product","name":"올드독 200g 추가 옵션","offers":{"@type":"Offer","price":"22000","priceCurrency":"KRW","availability":"https://schema.org/InStock"}}]}</script>
    </head></html>`;

  test("prefers the og base price over a JSON-LD add-on variant price", () => {
    expect(parseProductPage(cafe24, "KRW")).toEqual({ title: "[프릳츠] 올드독 200g", price: 17000, currency: "KRW", available: true, grams: 200 });
  });

  test("reads JSON-LD alone, including a sold-out offer and a weight in the description", () => {
    const html = `<script type="application/ld+json">[{"@type":"WebSite"},{"@type":"Product","name":"Ethiopia Hambela",
      "description":"Washed. 200 g bag.","offers":[{"price":"19000","priceCurrency":"KRW","availability":"https://schema.org/OutOfStock"}]}]</script>`;
    expect(parseProductPage(html, "KRW")).toEqual({ title: "Ethiopia Hambela", price: 19000, currency: "KRW", available: false, grams: 200 });
  });

  test("falls back to the first plausible bag size in the page text", () => {
    const html = `<script>var dose = "17g";</script><meta property="product:price:amount" content="52" />
      <title>La Torre Mejia (Peru)</title><dt>Weight</dt><p>250g</p><dd>17g</dd>`;
    expect(parseProductPage(html, "EUR")?.grams).toBe(250);
    expect(parseProductPage(`<meta property="product:price:amount" content="5" /><p>Dose 17g</p>`, "EUR")?.grams).toBeUndefined();
  });

  test("toWooBeans and page feeds share the filter that drops subscriptions and instant coffee", () => {
    const item = (name: string) => ({
      name,
      permalink: "https://example.com/p",
      prices: { price: "1000", currency_code: "KRW", currency_minor_unit: 0 },
      is_in_stock: true,
      attributes: [],
      categories: [{ name: "Coffee" }],
    });
    expect(toWooBeans([item("홈바리스타 3개월 200g"), item("펠트 크래프트 인스턴트 커피 30g"), item("케냐 카리미쿠이 200g")], MANHATTAN).map((b) => b.title)).toEqual([
      "케냐 카리미쿠이 200g",
    ]);
  });

  test("returns undefined for a page without a price", () => {
    expect(parseProductPage("<title>About us</title>", "KRW")).toBeUndefined();
  });
});

describe("productLinks", () => {
  test("keeps product links, drops listing params and duplicates", () => {
    const html = `<a href="/product/detail.html?product_no=8508&amp;cate_no=1&amp;display_group=22">a</a>
      <a href="/product/detail.html?product_no=8508&cate_no=47">b</a>
      <a href="/product/list.html?cate_no=47">list</a>
      <loc>https://feltcoffee.com/product/seasonal-espresso/29/</loc>`;
    expect(productLinks(html, "https://coffeelibre.kr/product/list.html?cate_no=47", /\/product\/(?:detail\.html\?product_no=\d+|[^/?#"]+\/\d+\/?$)/)).toEqual([
      "https://coffeelibre.kr/product/detail.html?product_no=8508",
      "https://feltcoffee.com/product/seasonal-espresso/29/",
    ]);
  });
});
