# OTP Email

A modular library to send and verify OTP via email, with optional Redis support for persistence, rate-limiting, and per-email attempt tracking.

---

## Key Features

* Send OTP via email.
* Attempt limits.
* Resend OTP.
* Rate-limiting.
* Logging.
* Redis (optional).
* Custom HTML templates.
* Whitelist/Blacklist.

---

## Installation

```bash
npm install fhylabs/otp-email
```

---

## API Reference

| Method                            | Parameters                       | Description                                      | Returns            |
| --------------------------------- | -------------------------------- | ------------------------------------------------ | ------------------ |
| `new OTPEmail(config)`            | `config` object                  | Initializes the library with configuration       | OTPEmail instance  |
| `send(email)`                     | `email` (string)                 | Sends OTP to the specified email                 | `Promise<boolean>` |
| `verify(email, otp)`              | `email` (string), `otp` (string) | Verifies the sent OTP (increments attempts)      | `Promise<boolean>` |
| `otpManager.generate(email)`      | `email` (string)                 | Generates OTP internally (for testing)           | `Promise<string>`  |
| `attemptLimiter.remaining(email)` | `email` (string)                 | Returns remaining attempts for an email          | `number`           |
| `attemptLimiter.reset(email)`     | `email` (string)                 | Resets attempt counter for an email (on success) | `void`             |

---

## Config Object

```javascript
const otp = new OTPEmail({
  EMAIL_FROM: '"OTP Email" <otp@example.com>', // sender email
  SMTP: {                                      // SMTP server config
    host: "smtp.example.com",
    port: 587,
    secure: false,
    auth: { 
      user: "user@example.com", 
      pass: "supersecret" 
    }
  },
  OTP: {                                        // OTP configuration
    length: 6,                                  // OTP length
    expiryMinutes: 5,                           // validity in minutes
    maxAttempts: 3                              // max attempts before blocked per OTP
  },
  RATE_LIMIT: {                                 // limit OTP requests
    maxRequests: 3,
    windowMinutes: 5
  },
  ATTEMPTS: {                                   // per-email attempt tracking
    maxAttempts: 3
  },
  RESEND: {                                     // resend OTP configuration
    maxResend: 2,
    resendWindowMinutes: 5
  },
  WHITELIST: null,                              // allowed emails (null = all)
  BLACKLIST: null,                              // blocked emails
  REDIS: {                                      // optional Redis support
    enabled: true,
    host: "127.0.0.1",
    port: 6379,
    password: null
  },
  TEMPLATES: {                                  // custom HTML template
    otp: "./templates/customOtp.html"
  }
});
```

---

## Complete Usage Example

See the [test/sample.js](./test/sample.js) file for a full usage example.

---

## Notes

* Optional Redis:

  * `enabled: true` → OTP, attempts & rate-limit stored in Redis.
  * `enabled: false` → fallback ke internal memory.
* Custom HTML template:

  * Customize via `TEMPLATES.otp`.
* Logger:

  * All logs stored at `<root-project>/logs/otp.log`.
* Whitelist/Blacklist:

  * Control allowed or blocked emails.
* Attempt Limiter:

  * Tracks OTP verification attempts per email.
* Resend Limiter:

  * Limit resend OTP to avoid spam.

---

## Folder Structure

```
otp-email/
├── src/
│   ├── core/
│   │   └── otpManager.js
│   ├── services/
│   │   ├── emailService.js
│   │   ├── rateLimiter.js
│   │   ├── resendLimiter.js
│   │   ├── attemptLimiter.js
│   │   └── logger.js
│   ├── templates/
│   │   └── otpTemplate.html
│   └── index.js
└── package.json
```