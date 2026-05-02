const { Schema, model } = require('mongoose');

const ReplySchema = new Schema({
  _id:     { type: String },
  name:    String,
  text:    String,
  isAdmin: { type: Boolean, default: false },
  likes:   { type: Number, default: 0 },
  ts:      { type: Number, default: Date.now },
}, { _id: false });

ReplySchema.set('toJSON', {
  transform: (_, ret) => { ret.id = ret._id; return ret; }
});

const CommentSchema = new Schema({
  _id:       { type: String },
  productId: { type: String, required: true, index: true },
  name:      String,
  text:      String,
  isAdmin:   { type: Boolean, default: false },
  likes:     { type: Number, default: 0 },
  ts:        { type: Number, default: Date.now },
  replies:   { type: [ReplySchema], default: [] },
}, { _id: false });

CommentSchema.set('toJSON', {
  transform: (_, ret) => { ret.id = ret._id; return ret; }
});

module.exports = model('Comment', CommentSchema);
