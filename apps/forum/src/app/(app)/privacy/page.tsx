/**
 * Route: /privacy — static placeholder until legal copy is finalized.
 */
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <section className="animate-route-emerge">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold text-(--text-primary)">Privacy policy</h1>
          <p className="text-sm text-(--text-muted)">Last updated: placeholder</p>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-(--text-secondary)">
          <p>
            This page is a minimal placeholder. A full privacy policy should describe what data is collected, how it is
            used, retention, cookies, third parties, and user rights under applicable law (e.g. GDPR, CCPA).
          </p>
          <p>
            Production deployments should document real data practices (including Convex-hosted content and auth) and
            link to any subprocessors or analytics providers.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
