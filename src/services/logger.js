const fs = require("fs");
const path = require("path");

class Logger {
    static log(event, data) {
        const logDir = path.join(process.cwd(), "logs");

        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }

        const logPath = path.join(logDir, "otp.log");
        const line = `[${new Date().toISOString()}] ${event} - ${JSON.stringify(data)}\n`;

        fs.appendFileSync(logPath, line);
    }
}

module.exports = Logger;
