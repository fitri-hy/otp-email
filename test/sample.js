const OTPEmail = require("../src");

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