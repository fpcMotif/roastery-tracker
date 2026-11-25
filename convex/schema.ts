import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

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
    finishedAt: v.number(),
    shops: v.number(),
    failed: v.array(v.object({ roasteryId: v.string(), error: v.string() })),
  }),
});
