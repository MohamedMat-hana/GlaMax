const router       = require('express').Router();
const Notification = require('../models/Notification');
const { adminAuth }= require('../middleware/auth');

router.get('/', adminAuth, async (req, res) => {
  const notes = await Notification.find().sort({ ts: -1 }).limit(50);
  res.json(notes);
});

router.patch('/read', adminAuth, async (req, res) => {
  await Notification.updateMany({ read: false }, { read: true });
  res.json({ ok: true });
});

module.exports = router;
