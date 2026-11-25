import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalAction, internalMutation } from "./_generated/server";
import { ROASTERIES } from "../src/roasteries.ts";
import { fetchBeans } from "../src/shop.ts";
import { fetchRates } from "../src/fx.ts";

const KEEP_RUNS_FOR = 2 * 24 * 3_600_000;

const beanFields = {
  roasteryId: v.string(),
  roasteryName: v.string(),
  title: v.string(),
  url: v.string(),
  publishedAt: v.string(),
  available: v.boolean(),
  currency: v.string(),
  price: v.number(),
  grams: v.number(),
  pricePer100g: v.number(),
};

export const replaceRoasteryBeans = internalMutation({
  args: { roasteryId: v.string(), beans: v.array(v.object(beanFields)) },
  returns: v.null(),
  handler: async (ctx, { roasteryId, beans }) => {
    const existing = await ctx.db
      .query("beans")
      .withIndex("by_roastery", (q) => q.eq("roasteryId", roasteryId))
      .collect();
    const previous = new Map(existing.map((b) => [b.url, b]));
    for (const old of existing) await ctx.db.delete(old._id);
    const now = Date.now();
    const newSinceLastSync = existing.length > 0 ? new Date(now).toISOString() : "";
    for (const bean of beans) {
      const seen = previous.get(bean.url);
      const publishedAt = bean.publishedAt || (seen ? seen.publishedAt : newSinceLastSync);
      await ctx.db.insert("beans", { ...bean, publishedAt, firstSeenAt: seen?.firstSeenAt ?? now });
    }
    return null;
  },
});

export const saveRun = internalMutation({
  args: {
    scope: v.optional(v.union(v.literal("api"), v.literal("pages"))),
    rates: v.union(v.null(), v.object({ base: v.string(), date: v.string(), rates: v.record(v.string(), v.number()) })),
    shops: v.number(),
    failed: v.array(v.object({ roasteryId: v.string(), error: v.string() })),
  },
  returns: v.null(),
  handler: async (ctx, { scope, rates, shops, failed }) => {
    if (rates) {
      for (const old of await ctx.db.query("rates").take(10)) await ctx.db.delete(old._id);
      await ctx.db.insert("rates", rates);
    }
    const now = Date.now();
    for (const old of await ctx.db.query("syncRuns").order("asc").take(50)) {
      if (old.finishedAt < now - KEEP_RUNS_FOR) await ctx.db.delete(old._id);
    }
    await ctx.db.insert("syncRuns", { scope, finishedAt: now, shops, failed });
    return null;
  },
});

export const syncAll = internalAction({
  args: { only: v.optional(v.union(v.literal("api"), v.literal("pages"))) },
  returns: v.null(),
  handler: async (ctx, { only }) => {
    const shops = ROASTERIES.filter(
      (r) => r.feed && (only === undefined || (only === "pages") === (r.feed.kind === "pages")),
    );
    const [rates, ...results] = await Promise.allSettled([fetchRates("USD"), ...shops.map(fetchBeans)]);
    const failed: { roasteryId: string; error: string }[] = [];
    for (const [i, result] of results.entries()) {
      const roastery = shops[i];
      if (!roastery) continue;
      if (result.status === "fulfilled") {
        await ctx.runMutation(internal.sync.replaceRoasteryBeans, { roasteryId: roastery.id, beans: result.value });
      } else {
        failed.push({ roasteryId: roastery.id, error: String(result.reason instanceof Error ? result.reason.message : result.reason) });
      }
    }
    await ctx.runMutation(internal.sync.saveRun, {
      scope: only,
      rates: rates.status === "fulfilled" ? (rates.value as Awaited<ReturnType<typeof fetchRates>>) : null,
      shops: shops.length,
      failed,
    });
    return null;
  },
});
