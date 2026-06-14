/**
 * Route: /notifications
 */
import { Suspense } from "react";

import { NotificationsPageClient } from "./notifications-page-client";

export default function NotificationsPage() {
  return (
    <Suspense fallback={null}>
      <NotificationsPageClient />
    </Suspense>
  );
}
