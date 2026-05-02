const { Schema, model } = require('mongoose');

const ProductSchema = new Schema({
  _id:        { type: String },
  nameAr:     { type: String, required: true },
  nameEn:     { type: String, default: '' },
  price:      { type: String, required: true },
  categoryAr: { type: String, required: true },
  categoryEn: { type: String, default: '' },
  img:        { type: String, default: '' },
  descAr:     { type: String, default: '' },
  descEn:     { type: String, default: '' },
  likes:      { type: Number, default: 0 },
  createdAt:  { type: Number, default: Date.now },
}, { _id: false });

ProductSchema.set('toJSON', {
  transform: (_, ret) => { ret.id = ret._id; return ret; }
});

module.exports = model('Product', ProductSchema);
