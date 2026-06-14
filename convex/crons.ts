import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "recompute hot feed cache",
  { minutes: 5 },
  internal.forum.feedCache.recomputeHotFeed,
  {},
);

crons.interval(
  "reconcile upvote counters",
  { minutes: 10 },
  internal.forum.jobs.reconcileUpvoteCounts,
  {},
);

crons.cron(
  "aggregate daily analytics",
  "0 3 * * *",
  internal.forum.jobs.aggregateDailyAnalytics,
  {},
);

crons.interval(
  "persona automation scheduler",
  { hours: 1 },
  internal.forum.personas.scheduler.runPersonaScheduler,
  {},
);

crons.cron(
  "discover trending topics daily",
  "0 6 * * *",
  internal.forum.personas.trendingAction.discoverTrendingTopics,
  {},
);

crons.cron(
  "scan human comments for persona replies",
  "0 * * * *",
  internal.forum.personas.replyScanner.scanHumanCommentsForReply,
  {},
);

export default crons;
