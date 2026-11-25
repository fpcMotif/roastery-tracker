import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval("sync shop APIs", { minutes: 15 }, internal.sync.syncAll, { only: "api" });
crons.interval("sync scraped shop pages", { hours: 1 }, internal.sync.syncAll, { only: "pages" });
crons.cron("sync health report", "0 0,12 * * *", internal.health.writeReport, {});

export default crons;
