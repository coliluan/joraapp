import express from 'express';
import multer from 'multer';
import path from 'path';
import Product from '../models/Product.model.js';

const router = express.Router();

// Storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads'); // ku ruhen imazhet
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  }
});

const upload = multer({ storage });

// GET - merr të gjitha produktet
router.get('/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Nuk u lexuan produktet' });
  }
});

export default router;
