import { describe, expect, test } from "bun:test";
import { COUNTRY_NAMES, ROASTERIES } from "../src/roasteries.ts";
import { countByCountry, filterRoasteries, parseTastings, triedRoasteries } from "../src/query.ts";

describe("dataset", () => {
  test("ids are unique", () => {
    expect(new Set(ROASTERIES.map((r) => r.id)).size).toBe(ROASTERIES.length);
  });

  test("includes SEY plus Japanese and South Korean roasters", () => {
    expect(ROASTERIES.find((r) => r.id === "sey")?.country).toBe("US");
    expect(filterRoasteries(ROASTERIES, { country: "JP" }).length).toBeGreaterThanOrEqual(10);
    expect(filterRoasteries(ROASTERIES, { country: "KR" }).length).toBeGreaterThanOrEqual(8);
  });

  test("every country code has a name", () => {
    for (const r of ROASTERIES) expect(COUNTRY_NAMES[r.country]).toBeDefined();
  });
});

describe("query", () => {
  test("city filter ignores case", () => {
    const names = filterRoasteries(ROASTERIES, { city: "SEOUL" }).map((r) => r.name);
    expect(names).toContain("Fritz Coffee Company");
    expect(names).not.toContain("Momos Coffee");
  });

  test("countByCountry sums to the dataset size", () => {
    const total = [...countByCountry(ROASTERIES).values()].reduce((a, b) => a + b, 0);
    expect(total).toBe(ROASTERIES.length);
  });

  test("triedRoasteries counts each roastery once", () => {
    const tastings = [
      { roasteryId: "sey", date: "2025-05-01" },
      { roasteryId: "sey", date: "2025-06-01" },
      { roasteryId: "glitch", date: "2025-07-01" },
    ];
    expect(triedRoasteries(ROASTERIES, tastings).map((r) => r.id).sort()).toEqual(["glitch", "sey"]);
  });

  test("parseTastings keeps optional fields and rejects bad ones", () => {
    expect(parseTastings([{ roasteryId: "sey", date: "2025-05-01", coffee: "Kenya" }])).toEqual([
      { roasteryId: "sey", date: "2025-05-01", coffee: "Kenya" },
    ]);
    expect(() => parseTastings({})).toThrow();
    expect(() => parseTastings([{ roasteryId: "sey", date: "x", note: 5 }])).toThrow();
  });
});
