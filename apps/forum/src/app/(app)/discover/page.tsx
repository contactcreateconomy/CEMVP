/**
 * Route: /discover
 */
import { Suspense } from "react";

import { DiscoverPageClient } from "./discover-page-client";

export default function DiscoverPage() {
  return (
    <Suspense fallback={null}>
      <DiscoverPageClient />
    </Suspense>
  );
}
