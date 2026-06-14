/**
 * Route: /saved
 */
import { Suspense } from "react";

import { SavedPageClient } from "./saved-page-client";

export default function SavedPage() {
  return (
    <Suspense fallback={null}>
      <SavedPageClient />
    </Suspense>
  );
}
