const router       = require('express').Router();
const { v4: uuid } = require('uuid');
const Chat         = require('../models/Chat');
const Notification = require('../models/Notification');
const { adminAuth }= require('../middleware/auth');

router.get('/', adminAuth, async (req, res) => {
  const chats = await Chat.find().sort({ lastTs: -1 });
  res.json(chats);
});

router.post('/', async (req, res) => {
  const { chatId, userName } = req.body;
  if (!userName) return res.status(400).json({ error: 'userName is required' });

  if (chatId) {
    const existing = await Chat.findById(chatId);
    if (existing) return res.json(existing);
  }

  const chat = await Chat.create({ userName, messages: [], lastTs: Date.now() });
  res.status(201).json(chat);
});

router.get('/:chatId/messages', async (req, res) => {
  const chat = await Chat.findById(req.params.chatId);
  if (!chat) return res.status(404).json({ error: 'Chat not found' });
  res.json(chat.messages);
});

router.post('/:chatId/messages', async (req, res) => {
  const { text, from, replyTo } = req.body;
  if (!text || !from) return res.status(400).json({ error: 'text and from are required' });

  const msg = { _id: uuid(), from, text: text.trim(), ts: Date.now(), replyTo: replyTo || null };

  const chat = await Chat.findByIdAndUpdate(
    req.params.chatId,
    {
      $push: { messages: msg },
      $set:  { lastTs: msg.ts },
      $inc:  from === 'user' ? { unreadByAdmin: 1 } : {},
    },
    { new: true }
  );
  if (!chat) return res.status(404).json({ error: 'Chat not found' });

  if (from === 'user') {
    await Notification.create({
      type: 'chat', chatId: chat._id.toString(),
      userName: chat.userName,
      messagePreview: text.slice(0, 80),
      ts: msg.ts,
    });
  }

  res.status(201).json(msg);
});

router.patch('/:chatId/read', adminAuth, async (req, res) => {
  await Chat.findByIdAndUpdate(req.params.chatId, { unreadByAdmin: 0 });
  res.json({ ok: true });
});

module.exports = router;
