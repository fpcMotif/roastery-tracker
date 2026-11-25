export type Rates = { base: string; date: string; rates: Record<string, number> };

export function parseRates(raw: unknown): Rates {
  const record = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {};
  const { base, date, rates } = record;
  if (typeof base !== "string" || typeof date !== "string" || typeof rates !== "object" || rates === null) {
    throw new Error("exchange-rate response needs base, date and rates");
  }
  const parsed: Record<string, number> = {};
  for (const [code, value] of Object.entries(rates)) {
    if (typeof value !== "number" || !(value > 0)) throw new Error(`exchange rate for ${code} must be a positive number`);
    parsed[code] = value;
  }
  return { base, date, rates: parsed };
}

export function convert(amount: number, from: string, rates: Rates): number | undefined {
  if (from === rates.base) return amount;
  const rate = rates.rates[from];
  return rate === undefined ? undefined : amount / rate;
}

export function convertTo(amount: number, from: string, to: string, rates: Rates): number | undefined {
  const inBase = convert(amount, from, rates);
  if (inBase === undefined) return undefined;
  if (to === rates.base) return inBase;
  const rate = rates.rates[to];
  return rate === undefined ? undefined : inBase * rate;
}

export async function fetchRates(base: string): Promise<Rates> {
  const response = await fetch(`https://api.frankfurter.dev/v1/latest?base=${encodeURIComponent(base)}`, {
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`exchange rates for ${base}: HTTP ${response.status}`);
  return parseRates(await response.json());
}
