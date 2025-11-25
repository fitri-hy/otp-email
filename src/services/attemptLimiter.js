class AttemptLimiter {
  constructor(config = {}) {
    this.maxAttempts = config.maxAttempts || 5;
    this.attempts = new Map();
  }

  addAttempt(email) {
    const current = this.attempts.get(email) || 0;
    const next = current + 1;
    this.attempts.set(email, next);
    return next <= this.maxAttempts;
  }

  reset(email) {
    this.attempts.delete(email);
  }

  remaining(email) {
    const current = this.attempts.get(email) || 0;
    return this.maxAttempts - current;
  }
}

module.exports = AttemptLimiter;
