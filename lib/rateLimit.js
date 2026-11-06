// Simple per-IP fixed-window rate limiter for the AI endpoints.
// Note: state is held in memory, so on serverless hosting each instance keeps its own counts.
// It stops casual abuse and runaway scripts; use a shared store (e.g. Upstash Redis) for hard guarantees.

const buckets = new Map();
const MAX_TRACKED = 5000;

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length > 0) return fwd.split(',')[0].trim();
  return req.socket?.remoteAddress || 'unknown';
}

// Returns true if the request is allowed. When blocked it sends a 429 and returns false.
export function rateLimit(req, res, { key, limit = 10, windowMs = 10 * 60 * 1000 }) {
  const now = Date.now();
  const id = `${key}:${clientIp(req)}`;
  let entry = buckets.get(id);

  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
    buckets.set(id, entry);
  }
  entry.count += 1;

  if (buckets.size > MAX_TRACKED) {
    for (const [k, v] of buckets) {
      if (now >= v.resetAt) buckets.delete(k);
    }
  }

  const remaining = Math.max(0, limit - entry.count);
  res.setHeader('X-RateLimit-Limit', String(limit));
  res.setHeader('X-RateLimit-Remaining', String(remaining));

  if (entry.count > limit) {
    const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    res.setHeader('Retry-After', String(retryAfter));
    res.status(429).json({ error: 'Too many requests. Please try again in a few minutes.' });
    return false;
  }
  return true;
}
