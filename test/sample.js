const OTPEmail = require("../src");

const otp = new OTPEmail({
  EMAIL_FROM: '"OTP Email" <otp@example.com>',	// OTP email sender address
  SMTP: {												// SMTP server configuration
    host: "smtp.example.com",
    port: 587,
    secure: false,
    auth: { 
	  user: "otp@example.com", 
	  pass: "supersecret" 
	}
  },
  OTP: {												// OTP settings
    length: 6, 
	expiryMinutes: 5, 
	maxAttempts: 3 
  },
  RATE_LIMIT: {											// limit OTP requests
    maxRequests: 3, 
	windowMinutes: 5 
  },
  ATTEMPTS: {											// OTP verification attempt limit per email
    maxAttempts: 3 
  },
  RESEND: {												// OTP resend settings
    maxResend: 2, 
	resendWindowMinutes: 5 
  },
  WHITELIST: null,										// allowed email list (null = all | array)
  BLACKLIST: null										// blocked email list (null = all | array)
  REDIS: {												// Redis configuration
    enabled: true, 
	host: "127.0.0.1", 
	port: 6379, 
	password: null 
  },
  TEMPLATES: {											// custom OTP email template
    otp: "./templates/customOtp.html"
  }
});


const readline = require("readline");
function questionAsync(rl, query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  try {
    // Enter the OTP destination email
    const email = await questionAsync(rl, "Enter destination email: ");

    // Send the first OTP
    await otp.send(email);
    console.log(`OTP successfully sent to: ${email}`);

    // Try resending OTP
    console.log("Trying to resend OTP...");
    try {
      await otp.send(email); // resend 1
      console.log("Resend 1 success!");
      await otp.send(email); // resend 2
      console.log("Resend 2 success!");
      await otp.send(email); // resend 3 (error if exceeding maxResend)
    } catch (resendErr) {
      console.error("Resend error:", resendErr.message); // show error if limit resend
    }

    // Loop OTP input until valid or max attempts are reached
    while (true) {
      const userInputOTP = await questionAsync(rl, "Enter the OTP code received: ");

      try {
        const verified = await otp.verify(email, userInputOTP); // OTP verification
        if (verified) {
          console.log("OTP is valid!"); //OTP valid, exit loop
          break;
        } else {
          console.log(`OTP is invalid. Attempts left: ${otp.attemptLimiter.remaining(email)}`);
        }
      } catch (err) {
        // Hit by limit attempts, exit the program
        console.error(`${err.message}`);
        console.log("Exiting program...");
        process.exit(1);
      }
    }

  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    rl.close();
  }
}

main();

