/**
 * upload.js — Standalone image upload endpoint.
 *
 * POST /api/upload   → multipart/form-data with field "image"
 *   Returns: { url: "/uploads/<filename>" }
 *   Auth: admin required
 */

const router    = require('express').Router();
const upload    = require('../middleware/upload');
const { adminAuth } = require('../middleware/auth');

/** POST /api/upload — receive image, save to disk, return public URL */
router.post('/', adminAuth, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }
  res.json({ url: `/uploads/${req.file.filename}` });
});

module.exports = router;
