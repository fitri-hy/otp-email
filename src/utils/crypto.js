const crypto = require("crypto");

module.exports = {
    generateOTP: (length = 6) => {
        return Math.floor(10**(length-1) + Math.random() * 10**length).toString();
    },
    hashOTP: (otp) => crypto.createHash('sha256').update(otp).digest('hex')
};
