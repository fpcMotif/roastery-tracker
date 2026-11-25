export type SyncRun = {
  scope?: "api" | "pages";
  finishedAt: number;
  failed: { roasteryId: string; error: string }[];
};

export type ShopFailure = { roasteryId: string; failures: number; lastError: string };

export type HealthReport = {
  windowStart: number;
  windowEnd: number;
  status: "ok" | "degraded" | "down";
  apiRuns: number;
  pagesRuns: number;
  expectedApiRuns: number;
  expectedPagesRuns: number;
  lastRunAt: number | null;
  failures: ShopFailure[];
};

const MINUTE = 60_000;
export const REPORT_WINDOW = 12 * 60 * MINUTE;
const API_EVERY = 15 * MINUTE;
const PAGES_EVERY = 60 * MINUTE;
const DOWN_AFTER = 60 * MINUTE;

export function buildReport(runs: SyncRun[], windowEnd: number, historyStart: number): HealthReport {
  const windowStart = windowEnd - REPORT_WINDOW;
  const inWindow = runs.filter((r) => r.finishedAt > windowStart && r.finishedAt <= windowEnd);
  const covered = windowEnd - Math.max(windowStart, historyStart);
  const expectedApiRuns = Math.max(0, Math.floor(covered / API_EVERY));
  const expectedPagesRuns = Math.max(0, Math.floor(covered / PAGES_EVERY));
  const apiRuns = inWindow.filter((r) => r.scope !== "pages").length;
  const pagesRuns = inWindow.filter((r) => r.scope !== "api").length;

  const byShop = new Map<string, ShopFailure>();
  for (const run of [...inWindow].sort((a, b) => a.finishedAt - b.finishedAt)) {
    for (const f of run.failed) {
      const entry = byShop.get(f.roasteryId) ?? { roasteryId: f.roasteryId, failures: 0, lastError: "" };
      entry.failures += 1;
      entry.lastError = f.error;
      byShop.set(f.roasteryId, entry);
    }
  }
  const failures = [...byShop.values()].sort((a, b) => b.failures - a.failures || a.roasteryId.localeCompare(b.roasteryId));

  const lastRunAt = runs.reduce<number | null>((last, r) => (r.finishedAt <= windowEnd && r.finishedAt > (last ?? 0) ? r.finishedAt : last), null);
  const missedRuns = apiRuns < expectedApiRuns - 2 || pagesRuns < expectedPagesRuns - 1;
  const status =
    lastRunAt === null || windowEnd - lastRunAt > DOWN_AFTER ? "down" : missedRuns || failures.length > 0 ? "degraded" : "ok";

  return { windowStart, windowEnd, status, apiRuns, pagesRuns, expectedApiRuns, expectedPagesRuns, lastRunAt, failures };
}
