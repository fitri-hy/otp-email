const redis = require("redis");

class ResendLimiter {
    constructor(config) {
        this.config = config;
        this.maxResend = (config.RESEND && config.RESEND.maxResend) || 3;
        this.resendWindow = (config.RESEND && config.RESEND.resendWindowMinutes) || 5;
        this.memoryStore = new Map();

        if (this.config.REDIS.enabled) {
            this.redisClient = redis.createClient({
                socket: { host: config.REDIS.host, port: config.REDIS.port },
                password: config.REDIS.password || undefined
            });
            this.redisClient.connect().catch(console.error);
            this.useRedis = true;
        } else {
            this.useRedis = false;
        }
    }

    async check(email) {
        const now = Date.now();

        if (this.useRedis) {
            const key = `resend:${email}`;
            const current = await this.redisClient.get(key);
            if (current && parseInt(current) >= this.maxResend) {
                throw new Error("OTP resend limit reached for this email. Try later.");
            }
            await this.redisClient.multi()
                .incr(key)
                .expire(key, this.resendWindow * 60)
                .exec();
        } else {
            const record = this.memoryStore.get(email) || { count: 0, start: now };
            if (now - record.start > this.resendWindow * 60 * 1000) {
                record.count = 0;
                record.start = now;
            }
            if (record.count >= this.maxResend) {
                throw new Error("OTP resend limit reached for this email. Try later.");
            }
            record.count += 1;
            this.memoryStore.set(email, record);
        }
    }
}

module.exports = ResendLimiter;
