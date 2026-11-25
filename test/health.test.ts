import { describe, expect, test } from "bun:test";
import { buildReport, type SyncRun } from "../src/health.ts";

const HOUR = 3_600_000;
const END = Date.UTC(2026, 10, 26, 12);
const START = END - 12 * HOUR;

function healthyRuns(): SyncRun[] {
  const runs: SyncRun[] = [];
  for (let t = START + 15 * 60_000; t <= END; t += 15 * 60_000) runs.push({ scope: "api", finishedAt: t, failed: [] });
  for (let t = START + HOUR; t <= END; t += HOUR) runs.push({ scope: "pages", finishedAt: t, failed: [] });
  return runs;
}

describe("buildReport", () => {
  test("a full 12 hours of clean runs is ok: 48 API syncs and 12 page syncs", () => {
    const report = buildReport(healthyRuns(), END, 0);
    expect(report).toMatchObject({ status: "ok", apiRuns: 48, expectedApiRuns: 48, pagesRuns: 12, expectedPagesRuns: 12, failures: [], lastRunAt: END });
  });

  test("shop failures make it degraded and are counted per shop with the latest error", () => {
    const runs = healthyRuns();
    runs[3]!.failed = [{ roasteryId: "glitch", error: "HTTP 429" }];
    runs[9]!.failed = [{ roasteryId: "glitch", error: "ECONNRESET" }, { roasteryId: "fritz", error: "HTTP 500" }];
    const report = buildReport(runs, END, 0);
    expect(report.status).toBe("degraded");
    expect(report.failures).toEqual([
      { roasteryId: "glitch", failures: 2, lastError: "ECONNRESET" },
      { roasteryId: "fritz", failures: 1, lastError: "HTTP 500" },
    ]);
  });

  test("missing cron runs make it degraded even when nothing failed", () => {
    const runs = healthyRuns().filter((r, i) => r.scope === "pages" || i % 2 === 0);
    expect(buildReport(runs, END, 0)).toMatchObject({ status: "degraded", apiRuns: 24, expectedApiRuns: 48 });
  });

  test("no run in the last hour means the cron is down", () => {
    const runs = healthyRuns().filter((r) => r.finishedAt <= END - 2 * HOUR);
    expect(buildReport(runs, END, 0).status).toBe("down");
    expect(buildReport([], END, 0)).toMatchObject({ status: "down", lastRunAt: null });
  });

  test("expects runs only for the part of the window that has history", () => {
    const runs = healthyRuns().filter((r) => r.finishedAt > END - 3 * HOUR);
    expect(buildReport(runs, END, END - 3 * HOUR)).toMatchObject({ status: "ok", expectedApiRuns: 12, expectedPagesRuns: 3 });
  });

  test("an unscoped full sync counts toward both API and page syncs", () => {
    const report = buildReport([{ finishedAt: END - 60_000, failed: [] }], END, END - 10 * 60_000);
    expect(report).toMatchObject({ apiRuns: 1, pagesRuns: 1, expectedApiRuns: 0, expectedPagesRuns: 0, status: "ok" });
  });
});
