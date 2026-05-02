const router       = require('express').Router();
const StoryReply   = require('../models/StoryReply');
const Notification = require('../models/Notification');
const { adminAuth }= require('../middleware/auth');

router.post('/', async (req, res) => {
  const { storyId, storyTitleAr, storyTitleEn, storyImg, senderName, message } = req.body;
  if (!senderName || !message || !storyId)
    return res.status(400).json({ error: 'storyId, senderName, and message are required' });

  const reply = await StoryReply.create({
    storyId, storyTitleAr, storyTitleEn, storyImg, senderName, message, ts: Date.now()
  });

  await Notification.create({
    type: 'story_reply',
    storyTitleAr, storyTitleEn, storyImg, senderName,
    messagePreview: message.slice(0, 80),
    ts: Date.now(),
  });

  res.status(201).json({ ok: true });
});

router.get('/', adminAuth, async (req, res) => {
  const replies = await StoryReply.find().sort({ ts: -1 });
  res.json(replies);
});

router.patch('/read', adminAuth, async (req, res) => {
  await StoryReply.updateMany({ read: false }, { read: true });
  res.json({ ok: true });
});

module.exports = router;
