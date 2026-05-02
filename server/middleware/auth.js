/**
 * auth.js — Admin authentication middleware.
 * Verifies that incoming requests carry a valid admin bearer token.
 * Token is a SHA-256 hex digest of ADMIN_PASSWORD + ADMIN_TOKEN_SECRET.
 */

const crypto = require('crypto');

/**
 * Computes the expected admin token from env vars.
 * @returns {string} SHA-256 hex string
 */
function computeToken() {
  const secret = (process.env.ADMIN_PASSWORD || 'glamax2025') +
                 (process.env.ADMIN_TOKEN_SECRET || 'glamax_secret_2025');
  return crypto.createHash('sha256').update(secret).digest('hex');
}

/**
 * Express middleware — rejects requests whose Authorization header
 * does not match the expected admin token.
 */
function adminAuth(req, res, next) {
  const header = req.headers['authorization'] || '';
  const token  = header.replace('Bearer ', '').trim();

  if (!token || token !== computeToken()) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}

module.exports = { adminAuth, computeToken };
