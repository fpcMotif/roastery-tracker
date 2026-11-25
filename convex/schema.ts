import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const healthReportFields = {
  windowStart: v.number(),
  windowEnd: v.number(),
  status: v.union(v.literal("ok"), v.literal("degraded"), v.literal("down")),
  apiRuns: v.number(),
  pagesRuns: v.number(),
  expectedApiRuns: v.number(),
  expectedPagesRuns: v.number(),
  lastRunAt: v.union(v.number(), v.null()),
  failures: v.array(v.object({ roasteryId: v.string(), failures: v.number(), lastError: v.string() })),
};

export default defineSchema({
  beans: defineTable({
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
    firstSeenAt: v.number(),
  })
    .index("by_roastery", ["roasteryId"])
    .index("by_url", ["url"]),
  rates: defineTable({
    base: v.string(),
    date: v.string(),
    rates: v.record(v.string(), v.number()),
  }),
  syncRuns: defineTable({
    scope: v.optional(v.union(v.literal("api"), v.literal("pages"))),
    finishedAt: v.number(),
    shops: v.number(),
    failed: v.array(v.object({ roasteryId: v.string(), error: v.string() })),
  }),
  healthReports: defineTable(healthReportFields),
});
