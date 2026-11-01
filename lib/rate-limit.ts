import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const bookingLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  prefix: "calyx:ratelimit:booking",
  timeout: 2000,
});

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; retryAfterSeconds: number };

export async function checkBookingRateLimit(
  identifier: string,
): Promise<RateLimitResult> {
  try {
    const { success, reset } = await bookingLimiter.limit(identifier);
    if (success) return { allowed: true };

    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((reset - Date.now()) / 1000),
    );
    return { allowed: false, retryAfterSeconds };
  } catch (error) {
    // Fail open: a Redis outage must not stop real clients from booking.
    console.error("Rate limiter unavailable", error);
    return { allowed: true };
  }
}

/** First address in x-forwarded-for, which Vercel sets and overwrites. */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim();
  return ip || "unknown";
}