/**
 * db.js — Flat-file JSON database helper.
 * Loads data.json on startup and provides load/save helpers.
 * All routes use readDb() / writeDb() to persist state.
 */

const fs   = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'data.json');

/** Default seed data used when data.json does not yet exist */
const SEED = {
  products: [
    {
      id: '1',
      name: 'Velvet Matte Lipstick',
      price: '199 ج',
      category: 'Lips',
      img: '',
      desc: 'لون عاطق عميق يدوم طوال اليوم',
      likes: 24,
      createdAt: Date.now()
    },
    {
      id: '2',
      name: 'Glow Foundation',
      price: '349 ج',
      category: 'Face',
      img: '',
      desc: 'تغطية كاملة مع لمسة ندية طبيعية',
      likes: 18,
      createdAt: Date.now()
    },
    {
      id: '3',
      name: 'Smoky Eye Palette',
      price: '275 ج',
      category: 'Eyes',
      img: '',
      desc: '9 درجات من الداكن إلى النود',
      likes: 31,
      createdAt: Date.now()
    },
    {
      id: '4',
      name: 'Rose Glow Blush',
      price: '149 ج',
      category: 'Face',
      img: '',
      desc: 'بلشر وردي بفضى إشراقة طبيعية',
      likes: 9,
      createdAt: Date.now()
    }
  ],
  stories: [
    {
      id: '1',
      title: 'عروض الأسبوع ✨',
      img: '',
      duration: 5000,
      createdAt: Date.now()
    },
    {
      id: '2',
      title: 'لوك الصيف 🌸',
      img: '',
      duration: 5000,
      createdAt: Date.now()
    },
    {
      id: '3',
      title: 'كولكشن جديد 🎀',
      img: '',
      duration: 5000,
      createdAt: Date.now()
    }
  ],
  comments: {},
  users: []
};

/**
 * Reads and parses data.json; creates it with seed data if missing.
 * @returns {object} The current database object
 */
function readDb() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(SEED, null, 2), 'utf8');
    return JSON.parse(JSON.stringify(SEED));
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

/**
 * Serialises the database object back to data.json.
 * @param {object} data - The full database object to persist
 */
function writeDb(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { readDb, writeDb };
