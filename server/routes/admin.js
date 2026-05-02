/**
 * admin.js — Admin authentication route.
 *
 * POST /api/admin/login
 *   Body: { password: string }
 *   Returns: { token: string }
 *   Auth: none
 *
 * Verifies password against ADMIN_PASSWORD env var and returns
 * a SHA-256 token the client stores in memory for subsequent admin requests.
 */

const router         = require('express').Router();
const { computeToken } = require('../middleware/auth');

/** POST /api/admin/login — validate password and return bearer token */
router.post('/login', (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  const expected = process.env.ADMIN_PASSWORD || 'glamax2025';

  if (password !== expected) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  return res.json({ token: computeToken() });
});

module.exports = router;
