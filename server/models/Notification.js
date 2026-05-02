const { Schema, model } = require('mongoose');

const NotificationSchema = new Schema({
  type:           String, // 'like' | 'story_reply' | 'chat'
  productId:      String,
  productNameAr:  String,
  productNameEn:  String,
  productImg:     String,
  storyTitleAr:   String,
  storyTitleEn:   String,
  storyImg:       String,
  senderName:     String,
  messagePreview: String,
  chatId:         String,
  userName:       String,
  ts:             { type: Number, default: Date.now },
  read:           { type: Boolean, default: false },
}, { timestamps: true });

NotificationSchema.set('toJSON', {
  transform: (_, ret) => { ret.id = ret._id.toString(); return ret; }
});

module.exports = model('Notification', NotificationSchema);
