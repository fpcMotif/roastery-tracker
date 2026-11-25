const digitsCache = new Map<string, number>();

function fractionDigits(currency: string): number {
  const cached = digitsCache.get(currency);
  if (cached !== undefined) return cached;
  let digits = 2;
  try {
    digits = new Intl.NumberFormat("en", { style: "currency", currency }).resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    digits = 2;
  }
  digitsCache.set(currency, digits);
  return digits;
}

export function money(amount: number, currency: string): string {
  const digits = fractionDigits(currency);
  return `${amount.toLocaleString("en", { minimumFractionDigits: digits, maximumFractionDigits: digits })} ${currency}`;
}

export function shortDate(iso: string): string {
  return iso ? iso.slice(0, 10) : "Unknown";
}

export function syncedAt(epochMs: number): string {
  return new Date(epochMs).toLocaleString("en", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}
