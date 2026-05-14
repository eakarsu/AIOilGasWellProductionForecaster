const rateLimit = require('express-rate-limit');

// 20 AI requests per hour per user (identified by JWT user id or IP fallback)
const aiRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  keyGenerator: (req) => {
    // Prefer user-based key to avoid IP ambiguity
    if (req.user) return `user_${req.user.id}`;
    return req.ip || 'unknown';
  },
  validate: {
    // Suppress the IPv6 warning — our keyGenerator prefers user IDs over raw IPs
    keyGeneratorIpFallback: false
  },
  message: { error: 'Too many AI requests. Limit is 20 per hour.' },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { aiRateLimiter };
