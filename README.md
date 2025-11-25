# OTP Email

A modular library to **send and verify OTP via email**, with optional **Redis support** for persistence and rate-limiting.

---

## Key Features

* Send OTP via email.
* Validation.
* Rate-limiting.
* Logging.
* Optional Redis support.
* Supports **custom templates**.

---

## Installation

```bash
// Not yet available
npm install otp-email
```

---

## API Reference

| Method                       | Parameters                       | Description                                | Returns            |
| ---------------------------- | -------------------------------- | ------------------------------------------ | ------------------ |
| `new OTPEmail(config)`       | `config` object                  | Initializes the library with configuration | OTPEmail instance  |
| `send(email)`                | `email` (string)                 | Sends OTP to the specified email           | `Promise<boolean>` |
| `verify(email, otp)`         | `email` (string), `otp` (string) | Verifies the sent OTP                      | `Promise<boolean>` |
| `otpManager.generate(email)` | `email` (string)                 | Generates OTP internally (for testing)     | `Promise<string>`  |

---

## Config Object

```javascript
const otp = new OTPEmail({
  EMAIL_FROM: '"OTP Email" <otp@example.com>',
  SMTP: {
    host: "smtp.example.com",
    port: 587,
    secure: false,
    auth: { 
      user: "user@example.com", 
      pass: "supersecret" 
    }
  },
  OTP: { 
    length: 6, 
    expiryMinutes: 5, 
    maxAttempts: 3 
  },
  RATE_LIMIT: { 
    maxRequests: 3, 
    windowMinutes: 5 
  },
  REDIS: { 
    enabled: true, 
    host: "127.0.0.1", 
    port: 6379, 
    password: null 
  },
  TEMPLATES: {
    otp: "./templates/customOtp.html"
  }
});
```

---

## Complete Usage Example

> Local Import
> `const OTPEmail = require("./src");`

```javascript
const OTPEmail = require("otp-email");

const otp = new OTPEmail({
  EMAIL_FROM: '"OTP Email" <otp@example.com>',
  SMTP: {
    host: "smtp.example.com",
    port: 587,
    secure: false,
    auth: { 
      user: "user@example.com", 
      pass: "supersecret" 
    }
  },
  OTP: { 
    length: 6, 
    expiryMinutes: 5, 
    maxAttempts: 3 
  },
  RATE_LIMIT: { 
    maxRequests: 3, 
    windowMinutes: 5 
  },
  REDIS: { 
    enabled: true, 
    host: "127.0.0.1", 
    port: 6379, 
    password: null 
  },
  TEMPLATES: {
    otp: "./templates/customOtp.html"
  }
});


const readline = require("readline");
const { stdin: input, stdout: output } = require("process");

async function main() {
  const rl = readline.createInterface({ input, output });

  try {
    const email = await rl.question("Enter destination email: ");
    await otp.send(email);
    console.log(`OTP successfully sent to: ${email}`);

    const userInputOTP = await rl.question("Enter the OTP code received: ");
    const isValid = await otp.verify(email, userInputOTP);
    console.log("OTP is valid:", isValid);

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    rl.close();
  }
}

main();
```

---

## Notes

* **Optional Redis**:

  * `enabled: true` → OTP & rate-limit stored in Redis.
  * `enabled: false` → fallback to internal memory.
* **Custom HTML template**:

  * Can be customized via `TEMPLATES.otp`.
* **Logger**: all logs are stored in `<root-project>/logs/otp.log`.

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
│   │   ├── logger.js
│   │   └── notification.js
│   ├── templates/
│   │   └── otpTemplate.html
│   ├── utils/
│   │   ├── crypto.js
│   │   ├── timer.js
│   │   └── validator.js
│   └── index.js
└── package.json
```