import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";
import { healthReportFields } from "./schema";
import { REPORT_WINDOW, buildReport } from "../src/health.ts";

const KEEP_REPORTS = 60;

export const writeReport = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const now = Date.now();
    const runs = await ctx.db.query("syncRuns").order("desc").take(400);
    const recent = runs.filter((r) => r.finishedAt > now - REPORT_WINDOW);
    const oldest = await ctx.db.query("syncRuns").order("asc").first();
    await ctx.db.insert("healthReports", buildReport(recent, now, oldest?.finishedAt ?? now));
    const reports = await ctx.db.query("healthReports").order("desc").take(KEEP_REPORTS + 20);
    for (const old of reports.slice(KEEP_REPORTS)) await ctx.db.delete(old._id);
    return null;
  },
});

export const reports = query({
  args: {},
  returns: v.array(v.object({ id: v.id("healthReports"), ...healthReportFields })),
  handler: async (ctx) => {
    const reports = await ctx.db.query("healthReports").order("desc").take(14);
    return reports.map(({ _id, _creationTime, ...report }) => ({ id: _id, ...report }));
  },
});
