let redisClient = null;
const redis = require("redis");

class RateLimiter {
    constructor(config) {
        this.config = config;

        if (this.config.REDIS.enabled) {
            redisClient = redis.createClient({
                socket: { host: config.REDIS.host, port: config.REDIS.port },
                password: config.REDIS.password || undefined
            });
            redisClient.connect().catch(console.error);
            this.useRedis = true;
        } else {
            this.useRedis = false;
            this.memoryStore = {};
        }
    }

    async check(email) {
        if (this.useRedis) {
            const key = `rate:${email}`;
            const current = await redisClient.get(key);
            if (current && parseInt(current) >= this.config.RATE_LIMIT.maxRequests) {
                throw new Error("Too many OTP requests. Try later.");
            }
            await redisClient.multi()
                .incr(key)
                .expire(key, this.config.RATE_LIMIT.windowMinutes * 60)
                .exec();
        } else {
            const now = Date.now();
            const record = this.memoryStore[email] || { count: 0, start: now };
            if (now - record.start > this.config.RATE_LIMIT.windowMinutes * 60 * 1000) {
                record.count = 0;
                record.start = now;
            }
            if (record.count >= this.config.RATE_LIMIT.maxRequests) {
                throw new Error("Too many OTP requests. Try later.");
            }
            record.count += 1;
            this.memoryStore[email] = record;
        }
    }
}

module.exports = RateLimiter;
