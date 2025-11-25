const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

class EmailService {
    constructor(config) {
        this.config = config;
        this.transporter = nodemailer.createTransport(this.config.SMTP);

        if (this.config.TEMPLATES && this.config.TEMPLATES.otp) {
            if (!fs.existsSync(this.config.TEMPLATES.otp)) {
                throw new Error("Template OTP custom tidak ditemukan di path: " + this.config.TEMPLATES.otp);
            }
            this.template = fs.readFileSync(this.config.TEMPLATES.otp, "utf8");
        } else {
            this.template = fs.readFileSync(path.join(__dirname, "../templates/otpTemplate.html"), "utf8");
        }
    }

    async sendOTP(email, otp) {
        const html = this.template
            .replace("{{otp}}", otp)
            .replace("{{expiry}}", this.config.OTP.expiryMinutes);

        await this.transporter.sendMail({
            from: this.config.EMAIL_FROM,
            to: email,
            subject: "Your OTP Code",
            html
        });

        return true;
    }
}

module.exports = EmailService;
