// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// 🔌 Shared Redis client (works on Vercel edge/serverless)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 🌐 Global rate limit: 100 requests / 10 minutes per IP
const globalLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(100, "10 m"),
  analytics: true,
  prefix: "rl-global",
});

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();

  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;

  // Vercel sometimes sets this
  // @ts-ignore
  if ((req as any).ip) return (req as any).ip as string;

  return "unknown";
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Only protect /api routes (can expand to others if you want)
  if (!path.startsWith("/api")) {
    return NextResponse.next();
  }

  const ip = getClientIp(req);

  // Global limit for all APIs
  const { success, limit, remaining, reset } = await globalLimiter.limit(ip);

  if (!success) {
    // Optional: add some headers for debugging
    const res = NextResponse.json(
      {
        error: "Too many requests",
        message: "Global API rate limit exceeded. Please try again later.",
      },
      { status: 429 }
    );

    res.headers.set("X-RateLimit-Limit", limit.toString());
    res.headers.set("X-RateLimit-Remaining", remaining.toString());
    res.headers.set("X-RateLimit-Reset", reset.toString());

    return res;
  }

  // Optional response headers for normal requests
  const res = NextResponse.next();
  res.headers.set("X-RateLimit-Limit", limit.toString());
  res.headers.set("X-RateLimit-Remaining", remaining.toString());
  res.headers.set("X-RateLimit-Reset", reset.toString());

  return res;
}

// This ensures middleware runs only on /api routes
export const config = {
  matcher: ["/api/:path*"],
};
