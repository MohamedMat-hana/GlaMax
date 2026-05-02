const router       = require('express').Router();
const { v4: uuid } = require('uuid');
const Comment      = require('../models/Comment');
const { adminAuth }= require('../middleware/auth');

router.get('/:productId', async (req, res) => {
  const comments = await Comment.find({ productId: req.params.productId }).sort({ ts: 1 });
  res.json(comments);
});

router.post('/:productId', async (req, res) => {
  const { name, text, isAdmin } = req.body;
  if (!name || !text) return res.status(400).json({ error: 'name and text are required' });

  const comment = new Comment({
    _id:       uuid(),
    productId: req.params.productId,
    name, text,
    isAdmin:   Boolean(isAdmin),
    likes:     0,
    ts:        Date.now(),
    replies:   [],
  });
  await comment.save();
  res.status(201).json(comment);
});

router.delete('/:productId/:commentId', adminAuth, async (req, res) => {
  const comment = await Comment.findByIdAndDelete(req.params.commentId);
  if (!comment) return res.status(404).json({ error: 'Comment not found' });
  res.json({ ok: true });
});

router.patch('/:productId/:commentId/like', async (req, res) => {
  const comment = await Comment.findByIdAndUpdate(
    req.params.commentId,
    { $inc: { likes: 1 } },
    { new: true }
  );
  if (!comment) return res.status(404).json({ error: 'Comment not found' });
  res.json({ likes: comment.likes });
});

router.post('/:productId/:commentId/replies', async (req, res) => {
  const { name, text, isAdmin } = req.body;
  if (!name || !text) return res.status(400).json({ error: 'name and text are required' });

  const reply = { _id: uuid(), name, text, isAdmin: Boolean(isAdmin), likes: 0, ts: Date.now() };
  const comment = await Comment.findByIdAndUpdate(
    req.params.commentId,
    { $push: { replies: reply } },
    { new: true }
  );
  if (!comment) return res.status(404).json({ error: 'Comment not found' });
  const saved = comment.replies[comment.replies.length - 1];
  res.status(201).json(saved);
});

router.delete('/:productId/:commentId/replies/:replyId', adminAuth, async (req, res) => {
  const comment = await Comment.findByIdAndUpdate(
    req.params.commentId,
    { $pull: { replies: { _id: req.params.replyId } } },
    { new: true }
  );
  if (!comment) return res.status(404).json({ error: 'Comment not found' });
  res.json({ ok: true });
});

router.patch('/:productId/:commentId/replies/:replyId/like', async (req, res) => {
  const comment = await Comment.findOneAndUpdate(
    { _id: req.params.commentId, 'replies._id': req.params.replyId },
    { $inc: { 'replies.$.likes': 1 } },
    { new: true }
  );
  if (!comment) return res.status(404).json({ error: 'Not found' });
  const reply = comment.replies.find(r => r._id === req.params.replyId);
  res.json({ likes: reply?.likes });
});

module.exports = router;
