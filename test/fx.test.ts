import { describe, expect, test } from "bun:test";
import { convert, convertTo, parseRates } from "../src/fx.ts";

const rates = parseRates({ amount: 1, base: "USD", date: "2026-11-24", rates: { JPY: 160, EUR: 0.8, DKK: 6.4 } });

describe("convert", () => {
  test("divides by the rate of the source currency", () => {
    expect(convert(1600, "JPY", rates)).toBe(10);
    expect(convert(8, "EUR", rates)).toBe(10);
    expect(convert(64, "DKK", rates)).toBe(10);
  });

  test("keeps the amount when it is already in the base currency", () => {
    expect(convert(25, "USD", rates)).toBe(25);
  });

  test("returns undefined for a currency without a rate", () => {
    expect(convert(100, "TWD", rates)).toBeUndefined();
  });
});

describe("convertTo", () => {
  test("crosses through the base currency", () => {
    expect(convertTo(1600, "JPY", "EUR", rates)).toBe(8);
    expect(convertTo(10, "USD", "JPY", rates)).toBe(1600);
    expect(convertTo(8, "EUR", "EUR", rates)).toBe(8);
  });

  test("returns undefined when either side has no rate", () => {
    expect(convertTo(100, "TWD", "EUR", rates)).toBeUndefined();
    expect(convertTo(100, "EUR", "TWD", rates)).toBeUndefined();
  });
});

describe("parseRates", () => {
  test("reads base, date and rates", () => {
    expect(rates.base).toBe("USD");
    expect(rates.date).toBe("2026-11-24");
  });

  test("rejects a malformed response", () => {
    expect(() => parseRates({ base: "USD" })).toThrow();
    expect(() => parseRates({ base: "USD", date: "x", rates: { JPY: "160" } })).toThrow();
  });
});
