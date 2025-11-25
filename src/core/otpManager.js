const crypto = require("../utils/crypto");
let redisClient = null;
const redis = require("redis");

class OTPManager {
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

    async generate(email) {
        const otp = crypto.generateOTP(this.config.OTP.length);
        const hashed = crypto.hashOTP(otp);

        if (this.useRedis) {
            await redisClient.setEx(`otp:${email}`, this.config.OTP.expiryMinutes * 60, hashed);
        } else {
            const expiry = Date.now() + this.config.OTP.expiryMinutes * 60 * 1000;
            this.memoryStore[email] = { hash: hashed, expiry };
        }

        return otp;
    }

    async verify(email, otp) {
        const hashed = crypto.hashOTP(otp);

        if (this.useRedis) {
            const stored = await redisClient.get(`otp:${email}`);
            return stored === hashed;
        } else {
            const record = this.memoryStore[email];
            if (!record) return false;
            if (Date.now() > record.expiry) return false;
            return record.hash === hashed;
        }
    }
}

module.exports = OTPManager;
