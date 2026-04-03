import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 120;

const ipBuckets = new Map<string, { count: number; resetAt: number }>();

function cleanupStale() {
  const now = Date.now();
  for (const [ip, bucket] of ipBuckets) {
    if (now >= bucket.resetAt) {
      ipBuckets.delete(ip);
    }
  }
}

let lastCleanup = Date.now();

export function middleware(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown";

  const now = Date.now();

  if (now - lastCleanup > WINDOW_MS * 2) {
    cleanupStale();
    lastCleanup = now;
  }

  const bucket = ipBuckets.get(ip);
  if (!bucket || now >= bucket.resetAt) {
    ipBuckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return NextResponse.next();
  }

  bucket.count += 1;
  if (bucket.count > MAX_REQUESTS) {
    return new NextResponse("Too many requests", {
      status: 429,
      headers: {
        "Retry-After": String(Math.ceil((bucket.resetAt - now) / 1000)),
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
