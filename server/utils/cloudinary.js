const cloudinary = require('cloudinary').v2;
const sharp      = require('sharp');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadBuffer(buffer, mimetype) {
  // Compress: max 1200px wide, JPEG quality 82 — results in ~150–400 KB
  const compressed = await sharp(buffer)
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 82, progressive: true })
    .toBuffer();

  const b64 = `data:image/jpeg;base64,${compressed.toString('base64')}`;
  const result = await cloudinary.uploader.upload(b64, { folder: 'glamax' });
  return result.secure_url;
}

module.exports = { cloudinary, uploadBuffer };
