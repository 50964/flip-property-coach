import Redis from 'ioredis'

type Options = {
  windowMs: number // milliseconds
  max: number
  redisUrl?: string
}

// Simple token-bucket limiter with optional Redis backing
export class RateLimiter {
  private windowMs: number
  private max: number
  private redis?: Redis
  private memory: Map<string, { count: number; resetAt: number }>

  constructor(opts: Options) {
    this.windowMs = opts.windowMs
    this.max = opts.max
    this.memory = new Map()
    if (opts.redisUrl) {
      this.redis = new Redis(opts.redisUrl)
    }
  }

  private now() {
    return Date.now()
  }

  async take(key: string) {
    const now = this.now()
    if (this.redis) {
      // Use a Redis INCR with expiry to approximate token bucket
      const redisKey = `rl:${key}`
      const val = await this.redis.incr(redisKey)
      if (val === 1) {
        await this.redis.pexpire(redisKey, this.windowMs)
      }
      const ttl = await this.redis.pttl(redisKey)
      return { remaining: Math.max(0, this.max - val), resetMs: ttl }
    }

    // In-memory fallback
    const entry = this.memory.get(key)
    if (!entry || now > entry.resetAt) {
      this.memory.set(key, { count: 1, resetAt: now + this.windowMs })
      return { remaining: this.max - 1, resetMs: this.windowMs }
    }
    entry.count += 1
    this.memory.set(key, entry)
    return { remaining: Math.max(0, this.max - entry.count), resetMs: entry.resetAt - now }
  }
}

// default limiter instances
export const paymentLimiter = new RateLimiter({ windowMs: 60_000, max: 10, redisUrl: process.env.RATE_LIMIT_REDIS_URL })
export const adminLimiter = new RateLimiter({ windowMs: 60_000, max: 30, redisUrl: process.env.RATE_LIMIT_REDIS_URL })
