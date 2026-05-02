const router            = require('express').Router();
const { v4: uuid }      = require('uuid');
const Product           = require('../models/Product');
const Notification      = require('../models/Notification');
const { adminAuth }     = require('../middleware/auth');
const upload            = require('../middleware/upload');
const { uploadBuffer }  = require('../utils/cloudinary');

router.get('/', async (req, res) => {
  const products = await Product.find().sort({ createdAt: -1 });
  res.json(products);
});

router.post('/', adminAuth, upload.single('image'), async (req, res) => {
  const { nameAr, nameEn, price, categoryAr, categoryEn, descAr, descEn } = req.body;
  if (!nameAr || !price || !categoryAr)
    return res.status(400).json({ error: 'nameAr, price, and categoryAr are required' });

  let img = '';
  if (req.file) {
    img = await uploadBuffer(req.file.buffer, req.file.mimetype);
  }

  const product = new Product({
    _id:        uuid(),
    nameAr,
    nameEn:     nameEn     || nameAr,
    price,
    categoryAr,
    categoryEn: categoryEn || categoryAr,
    img,
    descAr:     descAr || '',
    descEn:     descEn || descAr || '',
    likes:      0,
    createdAt:  Date.now(),
  });
  await product.save();
  res.status(201).json(product);
});

router.patch('/:id/like', async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { $inc: { likes: 1 } },
    { new: true }
  );
  if (!product) return res.status(404).json({ error: 'Product not found' });

  await Notification.create({
    type:          'like',
    productId:     product._id,
    productNameAr: product.nameAr,
    productNameEn: product.nameEn,
    productImg:    product.img,
    ts:            Date.now(),
  });

  res.json({ likes: product.likes });
});

router.delete('/:id', adminAuth, async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ ok: true });
});

module.exports = router;
