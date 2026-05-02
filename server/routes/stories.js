const router       = require('express').Router();
const { v4: uuid } = require('uuid');
const Story        = require('../models/Story');
const { adminAuth }= require('../middleware/auth');
const upload       = require('../middleware/upload');

router.get('/', async (req, res) => {
  const stories = await Story.find().sort({ createdAt: -1 });
  res.json(stories);
});

router.post('/', adminAuth, upload.single('image'), async (req, res) => {
  const { titleAr, titleEn, duration } = req.body;
  if (!titleAr) return res.status(400).json({ error: 'titleAr is required' });

  const story = new Story({
    _id:       uuid(),
    titleAr,
    titleEn:   titleEn || titleAr,
    img:       req.file ? `/uploads/${req.file.filename}` : '',
    duration:  parseInt(duration, 10) || 5000,
    createdAt: Date.now(),
  });
  await story.save();
  res.status(201).json(story);
});

router.delete('/:id', adminAuth, async (req, res) => {
  const story = await Story.findByIdAndDelete(req.params.id);
  if (!story) return res.status(404).json({ error: 'Story not found' });
  res.json({ ok: true });
});

module.exports = router;
