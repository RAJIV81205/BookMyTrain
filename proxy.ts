import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

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

  // @ts-ignore
  if ((req as any).ip) return (req as any).ip as string;

  return "unknown";
}

function withCorsHeaders(res: NextResponse, req: NextRequest) {
  const origin = req.headers.get("origin") || "*";

  res.headers.set("Access-Control-Allow-Origin", origin);
  res.headers.set("Vary", "Origin");
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.headers.set("Access-Control-Allow-Credentials", "true");

  return res;
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (!path.startsWith("/api")) {
    return NextResponse.next();
  }

  // 1️⃣ Preflight
  if (req.method === "OPTIONS") {
    const preflight = new NextResponse(null, { status: 204 });
    return withCorsHeaders(preflight, req);
  }

  const ip = getClientIp(req);
  const { success, limit, remaining, reset } = await globalLimiter.limit(ip);

  // 2️⃣ Rate limited
  if (!success) {
    const json = NextResponse.json(
      {
        error: "Too many requests",
        message: "Global API rate limit exceeded. Please try again later.",
      },
      { status: 429 }
    );

    json.headers.set("X-RateLimit-Limit", limit.toString());
    json.headers.set("X-RateLimit-Remaining", remaining.toString());
    json.headers.set("X-RateLimit-Reset", reset.toString());

    return withCorsHeaders(json, req);
  }

  // 3️⃣ Allowed
  const res = NextResponse.next();

  res.headers.set("X-RateLimit-Limit", limit.toString());
  res.headers.set("X-RateLimit-Remaining", remaining.toString());
  res.headers.set("X-RateLimit-Reset", reset.toString());

  return withCorsHeaders(res, req);
}

export const config = {
  matcher: ["/api/:path*"],
};
