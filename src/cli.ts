#!/usr/bin/env bun
import { parseArgs } from "node:util";
import { COUNTRY_NAMES, ROASTERIES, type CountryCode, type Roastery } from "./roasteries.ts";
import { countByCountry, filterRoasteries, parseTastings, triedRoasteries, type Tasting } from "./query.ts";
import { fetchBeans, type Bean } from "./shop.ts";
import { convert, fetchRates, type Rates } from "./fx.ts";

const TASTINGS_PATH =
  process.env.ROASTERY_TASTINGS ?? new URL("../data/tastings.json", import.meta.url).pathname;

const USAGE = `roastery <command>

  list    [--country JP] [--city seoul]
  stats
  beans   [--roastery sey] [--country JP] [--days 30] [--sort new|price] [--currency USD] [--all]
  try    <roastery-id> [--coffee "Ethiopia Guji"] [--note "jasmine, peach"] [--date YYYY-MM-DD]
  tried`;

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: {
    country: { type: "string" },
    city: { type: "string" },
    coffee: { type: "string" },
    note: { type: "string" },
    date: { type: "string" },
    roastery: { type: "string" },
    days: { type: "string" },
    sort: { type: "string" },
    all: { type: "boolean" },
    currency: { type: "string" },
  },
});

function formatRow(r: Roastery): string {
  return `${r.id.padEnd(20)} ${r.name.padEnd(34)} ${r.city.padEnd(28)} ${r.country}${r.note ? `  ${r.note}` : ""}`;
}

function parseCountry(value: string | undefined): CountryCode | undefined {
  if (value === undefined) return undefined;
  const code = value.toUpperCase();
  if (!(code in COUNTRY_NAMES)) throw new Error(`unknown country ${value}; use one of ${Object.keys(COUNTRY_NAMES).join(", ")}`);
  return code as CountryCode;
}

function formatBean(b: Bean, rates: Rates): string {
  const price = `${b.price.toFixed(2)} ${b.currency} / ${b.grams} g`;
  const converted = convert(b.pricePer100g, b.currency, rates);
  const per100 = converted === undefined ? `? ${rates.base}/100g` : `${converted.toFixed(2)} ${rates.base}/100g`;
  const stock = b.available ? "" : "  [sold out]";
  return `${(b.publishedAt || "date unknown").slice(0, 12).padEnd(12)}${b.roasteryName.padEnd(26)} ${b.title.slice(0, 48).padEnd(48)} ${price.padStart(24)}  ${per100.padStart(16)}${stock}\n            ${b.url}`;
}

async function beansCommand(): Promise<void> {
  const shops = filterRoasteries(ROASTERIES, { country: parseCountry(values.country) }).filter(
    (r) => r.feed && (!values.roastery || r.id === values.roastery),
  );
  if (shops.length === 0) throw new Error("no roastery with a shop feed matches; run \"roastery list\" for ids");
  const [rates, results] = await Promise.all([
    fetchRates((values.currency ?? "USD").toUpperCase()),
    Promise.allSettled(shops.map(fetchBeans)),
  ]);
  const per100 = (b: Bean) => convert(b.pricePer100g, b.currency, rates) ?? Number.POSITIVE_INFINITY;
  const days = values.days ? Number(values.days) : undefined;
  if (days !== undefined && !(days > 0)) throw new Error("--days must be a positive number");
  const since = days ? Date.now() - days * 86_400_000 : 0;
  let beans = results
    .flatMap((r) => (r.status === "fulfilled" ? r.value : []))
    .filter((b) => (values.all || b.available) && (days === undefined || Date.parse(b.publishedAt) >= since));
  if (values.sort === "price") beans = beans.sort((a, b) => per100(a) - per100(b));
  else beans = beans.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  for (const b of beans) console.log(formatBean(b, rates));
  console.log(`\n${beans.length} coffees from ${shops.length} shops. ECB rates of ${rates.date}, shipping not included.`);
  results.forEach((r, i) => {
    if (r.status === "rejected") console.error(`failed: ${shops[i]?.name}: ${r.reason instanceof Error ? r.reason.message : r.reason}`);
  });
}

async function loadTastings(): Promise<Tasting[]> {
  const file = Bun.file(TASTINGS_PATH);
  return (await file.exists()) ? parseTastings(await file.json()) : [];
}

async function main(): Promise<void> {
  const [command, arg] = positionals;
  switch (command) {
    case "list": {
      const rows = filterRoasteries(ROASTERIES, { country: parseCountry(values.country), city: values.city });
      for (const r of rows) console.log(formatRow(r));
      console.log(`\n${rows.length} roasteries`);
      return;
    }
    case "stats": {
      const tastings = await loadTastings();
      for (const [code, n] of countByCountry(ROASTERIES)) console.log(`${COUNTRY_NAMES[code].padEnd(16)} ${n}`);
      console.log(`\nTotal: ${ROASTERIES.length}  Tried: ${triedRoasteries(ROASTERIES, tastings).length}  Tastings: ${tastings.length}`);
      return;
    }
    case "beans":
      await beansCommand();
      return;
    case "try": {
      const roastery = ROASTERIES.find((r) => r.id === arg);
      if (!roastery) throw new Error(`unknown roastery id ${arg ?? "(none)"}; run "roastery list" for ids`);
      const date = values.date ?? new Date().toISOString().slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("--date must be YYYY-MM-DD");
      const tastings = await loadTastings();
      const tasting: Tasting = { roasteryId: roastery.id, date };
      if (values.coffee) tasting.coffee = values.coffee;
      if (values.note) tasting.note = values.note;
      tastings.push(tasting);
      await Bun.write(TASTINGS_PATH, `${JSON.stringify(tastings, null, 2)}\n`);
      console.log(`Logged ${roastery.name}${values.coffee ? ` (${values.coffee})` : ""} on ${date}`);
      return;
    }
    case "tried": {
      const tastings = await loadTastings();
      for (const t of tastings) {
        const r = ROASTERIES.find((x) => x.id === t.roasteryId);
        const coffee = t.coffee ? `  ${t.coffee}` : "";
        const note = t.note ? `  "${t.note}"` : "";
        console.log(`${t.date}  ${r ? r.name : t.roasteryId}${coffee}${note}`);
      }
      console.log(`\n${tastings.length} tastings`);
      return;
    }
    default:
      console.log(USAGE);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
