/**
 * Route: /leaderboard
 */
import { Suspense } from "react";

import { LeaderboardPageClient } from "./leaderboard-page-client";

export default function LeaderboardPage() {
  return (
    <Suspense fallback={null}>
      <LeaderboardPageClient />
    </Suspense>
  );
}
