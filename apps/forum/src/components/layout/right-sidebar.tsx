import { getLeaderboardWithUsers } from "@/lib/adapters/content";
import { PodiumWidget } from "@/components/layout/podium-widget";
import { WhatsVibingWidget } from "@/components/layout/whats-vibing-widget";
import { Card, CardContent } from "@/components/ui/card";

export function RightSidebar() {
  const rows = getLeaderboardWithUsers();

  return (
    <aside className="sticky top-20 hidden h-fit w-[320px] shrink-0 space-y-4 xl:block">
      <WhatsVibingWidget />

      <Card className="animate-soft-float" style={{ animationDelay: "100ms" }}>
        <CardContent className="p-3">
          <PodiumWidget rows={rows} />
        </CardContent>
      </Card>
    </aside>
  );
}
