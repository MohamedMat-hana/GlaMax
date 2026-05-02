const router = require('express').Router();
const User   = require('../models/User');

router.get('/:email', async (req, res) => {
  const user = await User.findOne({ email: req.params.email.toLowerCase() });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.post('/', async (req, res) => {
  const { name, email } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  await User.findOneAndUpdate(
    { email: (email || '').toLowerCase() },
    { name, email: (email || '').toLowerCase(), since: Date.now() },
    { upsert: true, new: true }
  );
  res.json({ ok: true, name, email });
});

module.exports = router;
