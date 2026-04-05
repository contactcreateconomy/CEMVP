import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "recompute hot feed cache",
  { minutes: 5 },
  internal.forum.feedCache.recomputeHotFeed,
);

export default crons;
