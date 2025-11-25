const OTPManager = require("./core/otpManager");
const EmailService = require("./services/emailService");
const Logger = require("./services/logger");
const RateLimiter = require("./services/rateLimiter");
const ResendLimiter = require("./services/resendLimiter");
const AttemptLimiter = require("./services/attemptLimiter");

class OTPEmail {
    constructor(config = {}) {
        this.config = {
            SMTP: config.SMTP || { host: "smtp.example.com", port: 587, secure: false, auth: { user: "user@example.com", pass: "supersecret" } },
            OTP: config.OTP || { length: 6, expiryMinutes: 5 },
            RATE_LIMIT: config.RATE_LIMIT || { maxRequests: 5, windowMinutes: 5 },
            RESEND: config.RESEND || { maxResend: 3, resendWindowMinutes: 5 },
            ATTEMPTS: config.ATTEMPTS || { maxAttempts: 5 },
            EMAIL_FROM: config.EMAIL_FROM || '"OTP Service" <otp@example.com>',
            REDIS: config.REDIS || { enabled: false, host: "127.0.0.1", port: 6379, password: null },
            TEMPLATES: config.TEMPLATES || null,
            WHITELIST: config.WHITELIST || null,
            BLACKLIST: config.BLACKLIST || null  
        };

        this.otpManager = new OTPManager(this.config);
        this.emailService = new EmailService(this.config);
        this.logger = Logger;
        this.rateLimiter = new RateLimiter(this.config);
        this.resendLimiter = new ResendLimiter(this.config);
        this.attemptLimiter = new AttemptLimiter(this.config.ATTEMPTS);
    }

    async send(email) {
        if (this.config.WHITELIST && !this.config.WHITELIST.includes(email)) {
            throw new Error(`This email is not allowed to receive OTP (not in whitelist): ${email}`);
        }
        if (this.config.BLACKLIST && this.config.BLACKLIST.includes(email)) {
            throw new Error(`This email is blocked from receiving OTP (blacklist): ${email}`);
        }

        await this.rateLimiter.check(email);
        await this.resendLimiter.check(email);
        const otp = await this.otpManager.generate(email);
        await this.emailService.sendOTP(email, otp);
        this.logger.log("OTP_SENT", { email });

        return true;
    }

    async verify(email, otp) {
        if (!this.attemptLimiter.addAttempt(email)) {
            throw new Error(`Maximum OTP attempts reached for ${email}`);
        }

        const result = await this.otpManager.verify(email, otp);
        this.logger.log("OTP_VERIFY", { email, result });

        if (result) this.attemptLimiter.reset(email);

        return result;
    }

    async generate(email) {
        return this.otpManager.generate(email);
    }
}

module.exports = OTPEmail;
