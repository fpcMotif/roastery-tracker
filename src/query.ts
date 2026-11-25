import type { CountryCode, Roastery } from "./roasteries.ts";

export type Filter = { country?: CountryCode; city?: string };

export type Tasting = { roasteryId: string; date: string; coffee?: string; note?: string };

export function filterRoasteries(roasteries: Roastery[], filter: Filter): Roastery[] {
  const city = filter.city?.toLowerCase();
  return roasteries.filter(
    (r) => (!filter.country || r.country === filter.country) && (!city || r.city.toLowerCase().includes(city)),
  );
}

export function countByCountry(roasteries: Roastery[]): Map<CountryCode, number> {
  const counts = new Map<CountryCode, number>();
  for (const r of roasteries) counts.set(r.country, (counts.get(r.country) ?? 0) + 1);
  return counts;
}

export function triedRoasteries(roasteries: Roastery[], tastings: Tasting[]): Roastery[] {
  const ids = new Set(tastings.map((t) => t.roasteryId));
  return roasteries.filter((r) => ids.has(r.id));
}

function optionalString(record: Record<string, unknown>, key: string, i: number): string | undefined {
  const value = record[key];
  if (value === undefined) return undefined;
  if (typeof value !== "string") throw new Error(`tasting ${i} field ${key} must be a string`);
  return value;
}

export function parseTastings(raw: unknown): Tasting[] {
  if (!Array.isArray(raw)) throw new Error("tastings file must hold a JSON array");
  return raw.map((item: unknown, i) => {
    if (typeof item !== "object" || item === null) throw new Error(`tasting ${i} must be an object`);
    const record = item as Record<string, unknown>;
    const { roasteryId, date } = record;
    if (typeof roasteryId !== "string" || typeof date !== "string") {
      throw new Error(`tasting ${i} needs string fields roasteryId and date`);
    }
    const tasting: Tasting = { roasteryId, date };
    const coffee = optionalString(record, "coffee", i);
    const note = optionalString(record, "note", i);
    if (coffee !== undefined) tasting.coffee = coffee;
    if (note !== undefined) tasting.note = note;
    return tasting;
  });
}
