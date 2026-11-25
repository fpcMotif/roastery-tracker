import { v } from "convex/values";
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
    const run = await ctx.db.query("syncRuns").order("desc").first();
    return {
      rates: rates ? { base: rates.base, date: rates.date, rates: rates.rates } : null,
      lastRun: run ? { finishedAt: run.finishedAt, shops: run.shops, failed: run.failed } : null,
    };
  },
});
