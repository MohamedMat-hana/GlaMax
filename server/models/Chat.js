const { Schema, model } = require('mongoose');

const MessageSchema = new Schema({
  _id:     { type: String },
  from:    { type: String, enum: ['user', 'admin'] },
  text:    String,
  ts:      { type: Number, default: Date.now },
  replyTo: { type: Schema.Types.Mixed, default: null },
}, { _id: false });

MessageSchema.set('toJSON', {
  transform: (_, ret) => { ret.id = ret._id; return ret; }
});

const ChatSchema = new Schema({
  userName:      { type: String, required: true },
  messages:      { type: [MessageSchema], default: [] },
  lastTs:        { type: Number, default: Date.now },
  unreadByAdmin: { type: Number, default: 0 },
}, { timestamps: true });

ChatSchema.set('toJSON', {
  transform: (_, ret) => { ret.id = ret._id.toString(); return ret; }
});

module.exports = model('Chat', ChatSchema);
