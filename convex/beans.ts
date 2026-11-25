import { v } from "convex/values";
import type { Doc } from "./_generated/dataModel";
import { query } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const beans = await ctx.db.query("beans").take(3000);
    return beans.map(({ _id, _creationTime, ...bean }) => ({ id: _id, ...bean }));
  },
});

export const status = query({
  args: {},
  returns: v.object({
    rates: v.union(v.null(), v.object({ base: v.string(), date: v.string(), rates: v.record(v.string(), v.number()) })),
    lastRun: v.union(
      v.null(),
      v.object({ finishedAt: v.number(), shops: v.number(), failed: v.array(v.object({ roasteryId: v.string(), error: v.string() })) }),
    ),
  }),
  handler: async (ctx) => {
    const rates = await ctx.db.query("rates").first();
    const latest = new Map<string, Doc<"syncRuns">>();
    for (const run of await ctx.db.query("syncRuns").order("desc").take(20)) {
      const scope = run.scope ?? "all";
      if (scope === "all" && latest.size > 0) break;
      if (!latest.has(scope)) latest.set(scope, run);
      if (scope === "all" || latest.size === 2) break;
    }
    const runs = [...latest.values()];
    return {
      rates: rates ? { base: rates.base, date: rates.date, rates: rates.rates } : null,
      lastRun:
        runs.length === 0
          ? null
          : {
              finishedAt: Math.max(...runs.map((r) => r.finishedAt)),
              shops: runs.reduce((sum, r) => sum + r.shops, 0),
              failed: runs.flatMap((r) => r.failed),
            },
    };
  },
});
