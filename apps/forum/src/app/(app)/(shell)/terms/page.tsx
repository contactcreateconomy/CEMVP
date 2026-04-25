/**
 * Route: /terms — static placeholder until legal copy is finalized.
 */
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <section className="animate-route-emerge">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold text-(--text-primary)">Terms of service</h1>
          <p className="text-sm text-(--text-muted)">Last updated: placeholder</p>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-(--text-secondary)">
          <p>
            This page is a minimal placeholder. Replace with your organization’s terms of service, acceptable use policy,
            and any marketplace or creator-specific rules before production.
          </p>
          <p>
            By using Createconomy discussion surfaces, you agree to follow community guidelines, respect intellectual
            property, and not abuse the platform. Final legal language will be provided by counsel.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
