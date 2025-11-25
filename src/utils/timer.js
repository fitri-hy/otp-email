module.exports = {
    getExpiryTimestamp: (minutes) => Date.now() + minutes * 60 * 1000
};
