/**
 * Route: /drafts
 */
import { Suspense } from "react";

import { DraftsPageClient } from "./drafts-page-client";

export default function DraftsPage() {
  return (
    <Suspense fallback={null}>
      <DraftsPageClient />
    </Suspense>
  );
}
