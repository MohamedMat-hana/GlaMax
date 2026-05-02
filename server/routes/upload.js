const router           = require('express').Router();
const upload           = require('../middleware/upload');
const { adminAuth }    = require('../middleware/auth');
const { uploadBuffer } = require('../utils/cloudinary');

router.post('/', adminAuth, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }
  const url = await uploadBuffer(req.file.buffer, req.file.mimetype);
  res.json({ url });
});

module.exports = router;
