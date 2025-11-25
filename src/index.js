const OTPManager = require("./core/otpManager");
const EmailService = require("./services/emailService");
const Logger = require("./services/logger");
const RateLimiter = require("./services/rateLimiter");

class OTPEmail {
    constructor(config = {}) {
        this.config = {
            SMTP: config.SMTP || { host: "smtp.example.com", port: 587, secure: false, auth: { user: "user@example.com", pass: "supersecret" } },
            OTP: config.OTP || { length: 6, expiryMinutes: 5, maxAttempts: 5 },
            RATE_LIMIT: config.RATE_LIMIT || { maxRequests: 5, windowMinutes: 5 },
            EMAIL_FROM: config.EMAIL_FROM || '"OTP Service" <otp@example.com>',
            REDIS: config.REDIS || { enabled: false, host: "127.0.0.1", port: 6379, password: null },
            TEMPLATES: config.TEMPLATES || null
        };

        this.otpManager = new OTPManager(this.config);
        this.emailService = new EmailService(this.config);
        this.logger = Logger;
        this.rateLimiter = new RateLimiter(this.config);
    }

    async send(email) {
        await this.rateLimiter.check(email);
        const otp = await this.otpManager.generate(email);
        await this.emailService.sendOTP(email, otp);
        this.logger.log("OTP_SENT", { email });
        return true;
    }

    async verify(email, otp) {
        const result = await this.otpManager.verify(email, otp);
        this.logger.log("OTP_VERIFY", { email, result });
        return result;
    }
}

module.exports = OTPEmail;
