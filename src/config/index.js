module.exports = {
    SMTP: {
        host: "smtp.example.com",
        port: 587,
        secure: false,
        auth: { user: "user@example.com", pass: "supersecret" }
    },
    OTP: {
        length: 6,
        expiryMinutes: 5,
        maxAttempts: 5
    },
    RATE_LIMIT: {
        maxRequests: 5,
        windowMinutes: 5
    },
    EMAIL_FROM: '"OTP Service" <otp@example.com>'
};
