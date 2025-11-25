module.exports = {
    isValidEmail: (email) => /\S+@\S+\.\S+/.test(email),
    isValidOTP: (otp, length = 6) => new RegExp(`^\\d{${length}}$`).test(otp)
};
