/**
 * seed.js — clears Products + Stories, uploads local seed images to Cloudinary,
 * then inserts 11 products and 4 stories into MongoDB.
 *
 * Run once from the server folder:
 *   node seed.js
 */

require('dotenv').config();
const path      = require('path');
const mongoose  = require('mongoose');
const { v4: uuid } = require('uuid');
const { cloudinary } = require('./utils/cloudinary');

const Product = require('./models/Product');
const Story   = require('./models/Story');

const UPLOADS = path.join(__dirname, 'uploads');

async function upload(filename) {
  const result = await cloudinary.uploader.upload(
    path.join(UPLOADS, filename),
    { folder: 'glamax', use_filename: true, unique_filename: false, overwrite: true }
  );
  console.log(`  ✓ ${filename} → ${result.secure_url}`);
  return result.secure_url;
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  await Product.deleteMany({});
  await Story.deleteMany({});
  console.log('Cleared existing data');

  console.log('\nUploading product images…');
  const imgs = {
    snakeStack:  await upload('ring-snake-stack.jpg'),
    heart:       await upload('ring-heart.jpg'),
    beadedStack: await upload('ring-beaded-stack.jpg'),
    clawOpen:    await upload('ring-claw-open.jpg'),
    diamondPave: await upload('ring-diamond-pave.jpg'),
    leaf:        await upload('ring-leaf.jpg'),
    pharaonic:   await upload('ring-pharaonic.jpg'),
    snakeDuo:    await upload('ring-snake-duo.jpg'),
    star:        await upload('ring-star.jpg'),
    swirlOval:   await upload('ring-swirl-oval.jpg'),
    earringStar: await upload('earring-star-stud.jpg'),
  };

  console.log('\nInserting products…');
  await Product.insertMany([
    {
      _id: uuid(), nameAr: 'خاتم Snake Stack', nameEn: 'Snake Stack Ring',
      price: '85 EGP', categoryAr: 'خواتم', categoryEn: 'Rings',
      descAr: 'خاتم أفعى أنيق بتصميم متراكب من الفضة عيار 925',
      descEn: 'Elegant layered snake ring in 925 sterling silver',
      img: imgs.snakeStack, likes: 0, createdAt: Date.now(),
    },
    {
      _id: uuid(), nameAr: 'خاتم القلب', nameEn: 'Heart Ring',
      price: '75 EGP', categoryAr: 'خواتم', categoryEn: 'Rings',
      descAr: 'خاتم قلب رومانسي بإطار ناعم ولامع',
      descEn: 'Romantic heart-shaped ring with a polished finish',
      img: imgs.heart, likes: 0, createdAt: Date.now(),
    },
    {
      _id: uuid(), nameAr: 'خاتم Beaded Stack', nameEn: 'Beaded Stack Ring',
      price: '70 EGP', categoryAr: 'خواتم', categoryEn: 'Rings',
      descAr: 'خاتم حبات ذهبي دقيق يمكن تركيبه مع أي خاتم آخر',
      descEn: 'Delicate gold bead ring perfect for stacking',
      img: imgs.beadedStack, likes: 0, createdAt: Date.now(),
    },
    {
      _id: uuid(), nameAr: 'خاتم Claw Open', nameEn: 'Claw Open Ring',
      price: '90 EGP', categoryAr: 'خواتم', categoryEn: 'Rings',
      descAr: 'خاتم مفتوح بتصميم مخلب جريء ومميز',
      descEn: 'Bold open claw ring with an adjustable fit',
      img: imgs.clawOpen, likes: 0, createdAt: Date.now(),
    },
    {
      _id: uuid(), nameAr: 'خاتم Diamond Pavé', nameEn: 'Diamond Pavé Ring',
      price: '120 EGP', categoryAr: 'خواتم', categoryEn: 'Rings',
      descAr: 'خاتم بأحجار زركون مرصوفة بأسلوب Pavé اللامع',
      descEn: 'Sparkling pavé-set zircon stone ring',
      img: imgs.diamondPave, likes: 0, createdAt: Date.now(),
    },
    {
      _id: uuid(), nameAr: 'خاتم الورقة', nameEn: 'Leaf Ring',
      price: '80 EGP', categoryAr: 'خواتم', categoryEn: 'Rings',
      descAr: 'خاتم على شكل ورقة طبيعية بتفاصيل دقيقة',
      descEn: 'Nature-inspired leaf ring with fine detailing',
      img: imgs.leaf, likes: 0, createdAt: Date.now(),
    },
    {
      _id: uuid(), nameAr: 'خاتم فرعوني', nameEn: 'Pharaonic Ring',
      price: '95 EGP', categoryAr: 'خواتم', categoryEn: 'Rings',
      descAr: 'خاتم بنقوش فرعونية أصيلة مستوحى من الحضارة المصرية القديمة',
      descEn: 'Authentic pharaonic motif ring inspired by ancient Egypt',
      img: imgs.pharaonic, likes: 0, createdAt: Date.now(),
    },
    {
      _id: uuid(), nameAr: 'خاتم Snake Duo', nameEn: 'Snake Duo Ring',
      price: '100 EGP', categoryAr: 'خواتم', categoryEn: 'Rings',
      descAr: 'خاتم أفعيين متشابكين بتصميم ثلاثي الأبعاد',
      descEn: 'Twin intertwined snakes in a bold 3D design',
      img: imgs.snakeDuo, likes: 0, createdAt: Date.now(),
    },
    {
      _id: uuid(), nameAr: 'خاتم النجمة', nameEn: 'Star Ring',
      price: '72 EGP', categoryAr: 'خواتم', categoryEn: 'Rings',
      descAr: 'خاتم نجمة بريق ساحر مثالي للإطلالات اليومية',
      descEn: 'Sparkling star ring perfect for everyday wear',
      img: imgs.star, likes: 0, createdAt: Date.now(),
    },
    {
      _id: uuid(), nameAr: 'خاتم Swirl Oval', nameEn: 'Swirl Oval Ring',
      price: '88 EGP', categoryAr: 'خواتم', categoryEn: 'Rings',
      descAr: 'خاتم بيضاوي بتصميم دوامة أنيق وعصري',
      descEn: 'Modern oval swirl ring with elegant curves',
      img: imgs.swirlOval, likes: 0, createdAt: Date.now(),
    },
    {
      _id: uuid(), nameAr: 'حلق النجمة', nameEn: 'Star Stud Earrings',
      price: '65 EGP', categoryAr: 'حلق', categoryEn: 'Earrings',
      descAr: 'حلق نجمة صغيرة أنيقة تناسب كل المناسبات',
      descEn: 'Elegant small star studs perfect for any occasion',
      img: imgs.earringStar, likes: 0, createdAt: Date.now(),
    },
  ]);
  console.log('✓ 11 products inserted');

  console.log('\nInserting stories…');
  await Story.insertMany([
    {
      _id: uuid(), titleAr: 'كولكشن الخواتم الجديد 💍',
      titleEn: 'New Rings Collection 💍',
      img: imgs.snakeStack, duration: 5000, createdAt: Date.now(),
    },
    {
      _id: uuid(), titleAr: 'خواتم فرعونية أصيلة ✨',
      titleEn: 'Authentic Pharaonic Rings ✨',
      img: imgs.pharaonic, duration: 5000, createdAt: Date.now(),
    },
    {
      _id: uuid(), titleAr: 'أحجار لامعة Diamond Pavé 💎',
      titleEn: 'Sparkling Diamond Pavé 💎',
      img: imgs.diamondPave, duration: 5000, createdAt: Date.now(),
    },
    {
      _id: uuid(), titleAr: 'حلق النجمة — إطلالة كاملة ⭐',
      titleEn: 'Star Studs — Complete Look ⭐',
      img: imgs.earringStar, duration: 5000, createdAt: Date.now(),
    },
  ]);
  console.log('✓ 4 stories inserted');

  console.log('\n🎉 Seed complete!');
  await mongoose.disconnect();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
