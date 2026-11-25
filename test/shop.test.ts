import { describe, expect, test } from "bun:test";
import { parseWeightGrams, toBeans } from "../src/shop.ts";

const SEY = { id: "sey", name: "SEY Coffee", city: "New York (Brooklyn)", country: "US" as const, shop: "seycoffee.com" };

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

  test("multiplies multi-bag sizes", () => {
    expect(parseWeightGrams("2 x 250g")).toBe(500);
    expect(parseWeightGrams("3×100g")).toBe(300);
  });
});

describe("toBeans", () => {
  const beans = toBeans(feed, SEY, "USD");

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

  test("marks sold-out coffees", () => {
    expect(beans.find((b) => b.title === "Old Kenya")?.available).toBe(false);
  });

  test("rejects a feed without a products array", () => {
    expect(() => toBeans({}, SEY, "USD")).toThrow();
  });
});
