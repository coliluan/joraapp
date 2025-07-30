
import bcrypt from 'bcrypt';
import bodyParser from 'body-parser';
import { createCanvas } from 'canvas';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import JsBarcode from 'jsbarcode';
import mongoose from 'mongoose';
import morgan from 'morgan';
import multer from 'multer';
import NotificationModel from '../backend/models/Notification.model.js';


import { Expo } from 'expo-server-sdk';
import fetch from 'node-fetch';

// Global Buffer për MongoDB
global.Buffer = global.Buffer || require('buffer').Buffer;

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
// const MONGO_URL = process.env.MONGO_URL || 'mongodb+srv://coliluan1:Luan12345@joracenterapp.nwiqgem.mongodb.net/';

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/dbconnect';

const storage = multer.memoryStorage();
const upload = multer({ storage });
// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json()); 
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));


// Connect to MongoDB
mongoose.connect(MONGO_URL)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  password: String,
  email: { type: String, default: null },
  city: String,
  number: String,
  address: String,
  postalCode: String,
  photo: String, 
  barcode: String,
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user',
  },
  expoPushToken: String,
}, { timestamps: true });

const UserModel = mongoose.model('users', userSchema);

const pdfSchema = new mongoose.Schema({
  name: String,         
  customName: String,
  customSubtitle: String,
  data: mongoose.Schema.Types.Buffer,
  contentType: String,
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

const PdfModel = mongoose.model('pdfs', pdfSchema);

const productStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/products/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const productUpload = multer({ storage: productStorage });

const productSchema = new mongoose.Schema({
  title: String,
  price: String,
  imageUrl: String,
});
const ProductModel = mongoose.model('products', productSchema);

app.get('/api/products', async (req, res) => {
  const products = await ProductModel.find().sort({ createdAt: -1 });
  res.json(products);
});

app.post('/api/upload-product', productUpload.single('image'), async (req, res) => {
  const { title, price } = req.body;
  const imageUrl = `/uploads/${req.file.filename}`;
  const product = await ProductModel.create({ title, price, imageUrl });
  res.status(201).json(product);
});



app.post('/api/upload-pdf', upload.single('file'), async (req, res) => {
  try {
    const { customName, customSubtitle } = req.body;

    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ message: 'Lejohen vetëm PDF.' });
    }

    const pdf = new PdfModel({
      name: req.file.originalname,
      customName,
      customSubtitle,
      data: req.file.buffer,
      contentType: req.file.mimetype,
    });

    await pdf.save(); // 💥 kjo mungonte

    return res.status(200).json({ message: 'Uploaded successfully', pdfId: pdf._id });
  } catch (error) {
    console.error('❌ Error uploading PDF:', error);
    return res.status(500).json({ message: 'Gabim gjatë ruajtjes së PDF.' });
  }
});

app.get('/api/pdf/:id', async (req, res) => {
  try {
    const pdf = await PdfModel.findById(req.params.id);
    if (!pdf) return res.status(404).send('PDF not found');

    // Vendos header për të parandaluar shkarkimin automatik në Android
    res.set({
      'Content-Type': pdf.contentType,
      'Content-Disposition': 'inline',
      'Cache-Control': 'public, max-age=86400', // Cache për 1 ditë
      'X-Content-Type-Options': 'nosniff',
    });

    res.send(pdf.data); // Dërgo PDF-in
  } catch (error) {
    console.error('❌ Error loading PDF:', error);
    res.status(500).send('Error loading PDF');
  }
});

app.get('/api/pdfs', async (req, res) => {
  try {
    const pdfs = await PdfModel.find({}, '_id name customName customSubtitle uploadedAt'); // added customSubtitle
    res.status(200).json(pdfs);
  } catch (error) {
    console.error('❌ Error fetching PDFs:', error);
    res.status(500).json({ message: 'Gabim gjatë marrjes së PDF-ve.' });
  }
});

app.delete('/api/pdf/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await PdfModel.findByIdAndDelete(id);
    res.status(200).json({ message: 'PDF u fshi me sukses' });
  } catch (error) {
    console.error('❌ Gabim gjatë fshirjes së PDF:', error);
    res.status(500).json({ message: 'Gabim në server' });
  }
});

app.post('/api/user/push-token', async (req, res) => {
  const { firstName, expoPushToken } = req.body;

  if (!firstName || !expoPushToken) {
    return res.status(400).json({ message: 'Mungon emri ose push token.' });
  }

  try {
    const user = await UserModel.findOneAndUpdate(
      { firstName },
      { expoPushToken },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'Përdoruesi nuk u gjet.' });
    }

    return res.status(200).json({ message: 'Push token u ruajt me sukses!' });
  } catch (error) {
    console.error('❌ Error saving push token:', error);
    return res.status(500).json({ message: 'Gabim në server.' });
  }
});

async function sendPushNotification(expoPushToken, title, body) {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: title,
    body: body,
  };

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const data = await response.json();
    console.log('📲 Notification sent:', data);
    return data;
  } catch (error) {
    console.error('❌ Error sending push notification:', error);
  }
}
app.post('/api/notify', async (req, res) => {
  const { title, body } = req.body;

  try {
    const users = await UserModel.find({ expoPushToken: { $exists: true, $ne: null } });
    if (users.length === 0) {
      return res.status(404).json({ message: 'Asnjë përdorues nuk ka push token të regjistruar.' });
    }

    // Ruaj njoftimin në DB
    await NotificationModel.create({ title, body });

    const expo = new Expo();

    const uniqueTokens = [...new Set(users.map((u) => u.expoPushToken))];
    const messages = uniqueTokens
      .filter(token => Expo.isExpoPushToken(token))
      .map(token => ({
        to: token,
        sound: 'default',
        title,
        body,
      }));

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (let chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error('❌ Error sending chunk:', error);
      }
    }

    console.log('📨 Push tickets:', tickets);

    return res.status(200).json({
      message: `Notifikimi u dërgua te ${uniqueTokens.length} pajisje.`,
      tickets,
    });
  } catch (error) {
    console.error('❌ Error sending notifications:', error);
    return res.status(500).json({ message: 'Gabim gjatë dërgimit të notifikimeve.' });
  }
});

app.get('/api/notifications', async (req, res) => {
  try {
    const notifications = await NotificationModel.find().sort({ sentAt: -1 });
    res.status(200).json(notifications); // kjo dërgon array
  } catch (error) {
    console.error('❌ Error loading notifications:', error);
    res.status(500).json({ message: 'Gabim gjatë leximit të njoftimeve.' });
  }
});

// Test endpoint për një token specifik
app.post('/api/test-notification', async (req, res) => {
  const { token, title, body } = req.body;

  if (!token || !title || !body) {
    return res.status(400).json({ message: 'Token, title dhe body janë të detyrueshme.' });
  }

  try {
    const result = await sendPushNotification(token, title, body);
    return res.status(200).json({ 
      message: 'Test notification u dërgua!', 
      result,
      token: token 
    });
  } catch (error) {
    console.error('❌ Error sending test notification:', error);
    return res.status(500).json({ message: 'Gabim gjatë dërgimit të test notification.' });
  }
});
// POST /api/save-push-token
app.post('/api/save-push-token', async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: 'No token provided' });

  try {
    // Ruaj në databazë duke përdorur UserModel
    const user = await UserModel.findOneAndUpdate(
      { expoPushToken: token },
      { expoPushToken: token },
      { upsert: true, new: true }
    );

    res.json({ success: true, user });
  } catch (error) {
    console.error('❌ Error saving push token:', error);
    res.status(500).json({ error: 'Gabim në server' });
  }
});

// POST /api/send-broadcast
app.post('/api/send-broadcast', async (req, res) => {
  const { title, body } = req.body;

  try {
    const users = await UserModel.find({ expoPushToken: { $exists: true, $ne: null } });
    const expo = new Expo();

    const messages = users.map((user) => {
      if (!Expo.isExpoPushToken(user.expoPushToken)) return null;
      return {
        to: user.expoPushToken,
        sound: 'default',
        title,
        body,
      };
    }).filter(Boolean);

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (let chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error(error);
      }
    }

    res.json({ success: true, tickets, message: `Notifikimi u dërgua te ${users.length} përdorues` });
  } catch (error) {
    console.error('❌ Error sending broadcast:', error);
    res.status(500).json({ error: 'Gabim në server' });
  }
});

app.delete('/api/notifications/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await NotificationModel.findByIdAndDelete(id);
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting notification:', err);
    res.status(500).json({ message: 'Error deleting notification' });
  }
});



app.post('/api/store-token', async (req, res) => {
  const { userId, token } = req.body;

  if (!userId || !token) {
    return res.status(400).json({ message: 'Mungon userId ose token.' });
  }

  try {
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: 'Përdoruesi nuk u gjet.' });

    if (user.expoPushToken !== token) {
      user.expoPushToken = token;
      await user.save();
    }

    return res.status(200).json({ message: 'Token u ruajt me sukses!' });
  } catch (err) {
    console.error('❌ Error storing push token:', err);
    return res.status(500).json({ message: 'Gabim në server.' });
  }
});


// 📥 Register Endpoint
app.post('/api/register', async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    city,
    number,
    role,
    expoPushToken,
  } = req.body;

  // Validim bazik
  if (!firstName || !lastName || !email || !password || !confirmPassword || !city || !number) {
    return res.status(400).json({ message: 'Të gjitha fushat janë të detyrueshme.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Fjalëkalimet nuk përputhen.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Fjalëkalimi duhet të ketë të paktën 6 karaktere.' });
  }

  try {
    // Kontrollo nëse ekziston emaili
    const existingEmail = await UserModel.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Ky email është i regjistruar.' });
    }

    // Kontrollo nëse ekziston numri i telefonit
    const existingUser = await UserModel.findOne({ number });
    if (existingUser) {
      return res.status(400).json({ message: 'Ky numër telefoni është i regjistruar.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const barcode = `${Math.floor(100000000000 + Math.random() * 900000000000)}`;

    const newUser = new UserModel({
      firstName,
      lastName,
      email: email.toLowerCase(), // ruaje ashtu siç e shkruan përdoruesi, por gjithmonë lowercase për standard
      password: hashedPassword,
      city,
      number,
      barcode,
      role: role || 'user',
      expoPushToken: expoPushToken || null,
    });

    await newUser.save();
    return res.status(200).json({ message: 'Regjistrimi u krye me sukses!', user: newUser });
  } catch (error) {
    console.error('❌ Error saving user:', error);
    return res.status(500).json({ message: 'Gabim në server gjatë regjistrimit.' });
  }
});

// 🔐 Login
app.post('/api/login', async (req, res) => {
  const { firstName, password } = req.body;

  try {
    const user = await UserModel.findOne({ firstName });
    if (!user) {
      return res.status(401).json({ message: 'Emri nuk ekziston' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Fjalëkalimi është i pasaktë' });
    }

    const { _id, firstName: name, lastName, city, email, number, address, postalCode, photo, barcode, role } = user;
    console.log('👉 Roli nga databaza:', role);

    return res.status(200).json({
      message: 'Login i suksesshëm',
      user: { _id, firstName: name, lastName, city, number,email, address, postalCode, photo, barcode, role }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    return res.status(500).json({ message: 'Gabim në server gjatë login.' });
  }

});

// 🏠 Update Address Endpoint
app.put('/api/user/address', async (req, res) => {
  const { firstName, address, postalCode, city } = req.body;

  if (!firstName) {
    return res.status(400).json({ message: 'Emri është i kërkuar për azhurnim.' });
  }

  try {
    const user = await UserModel.findOneAndUpdate(
      { firstName },
      { address, postalCode, city },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'Përdoruesi nuk u gjet.' });
    }

    return res.status(200).json({ message: 'Adresa u ruajt me sukses!', user });
  } catch (error) {
    console.error('❌ Error updating address:', error);
    return res.status(500).json({ message: 'Gabim në server.' });
  }
});

// 🖼️ Update Profile Photo Endpoint
app.put('/api/user/photo', async (req, res) => {
  const { firstName, photo } = req.body;

  if (!firstName || !photo) {
    return res.status(400).json({ message: 'Emri dhe foto janë të nevojshme.' });
  }

  try {
    const user = await UserModel.findOneAndUpdate(
      { firstName },
      { photo },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'Përdoruesi nuk u gjet.' });
    }

    return res.status(200).json({ message: 'Foto u ruajt me sukses!', user });
  } catch (error) {
    console.error('❌ Error updating photo:', error);
    return res.status(500).json({ message: 'Gabim në server.' });
  }
});

// ✅ GET user by firstName
app.get('/api/user/:firstName', async (req, res) => {
  const { firstName } = req.params;

  try {
    const user = await UserModel.findOne({ firstName });

    if (!user) {
      return res.status(404).json({ message: 'Përdoruesi nuk u gjet.' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    return res.status(500).json({ message: 'Gabim në server.' });
  }
});

// 🔍 GET all admin users
app.get('/api/users/admin', async (req, res) => {
  try {
    const adminUsers = await UserModel.find({ role: 'admin' }, { 
      firstName: 1, 
      lastName: 1, 
      city: 1, 
      email:1,
      number: 1, 
      role: 1,
      expoPushToken: 1 
    });

    return res.status(200).json({ 
      message: `U gjetën ${adminUsers.length} përdorues admin`,
      adminUsers 
    });
  } catch (error) {
    console.error('❌ Error fetching admin users:', error);
    return res.status(500).json({ message: 'Gabim në server.' });
  }
});

// 🔍 GET all users (admin only)
app.get('/api/users', async (req, res) => {
  try {
    const users = await UserModel.find({}, { 
      firstName: 1, 
      lastName: 1, 
      city: 1, 
      email: 1,
      number: 1, 
      role: 1,
      expoPushToken: 1 
    });

    return res.status(200).json({ 
      message: `U gjetën ${users.length} përdorues`,
      users 
    });
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    return res.status(500).json({ message: 'Gabim në server.' });
  }
});

// 🔄 Update user role
app.put('/api/user/role', async (req, res) => {
  const { firstName, role } = req.body;

  if (!firstName || !role) {
    return res.status(400).json({ message: 'Emri dhe roli janë të detyrueshme.' });
  }

  if (!['admin', 'user'].includes(role)) {
    return res.status(400).json({ message: 'Roli duhet të jetë "admin" ose "user".' });
  }

  try {
    const user = await UserModel.findOneAndUpdate(
      { firstName },
      { role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'Përdoruesi nuk u gjet.' });
    }

    return res.status(200).json({ 
      message: `Roli u ndryshua në ${role}!`, 
      user 
    });
  } catch (error) {
    console.error('❌ Error updating user role:', error);
    return res.status(500).json({ message: 'Gabim në server.' });
  }
});

// 🔒 Change Password Endpoint
app.put('/api/user/password', async (req, res) => {
  const { firstName, oldPassword, newPassword } = req.body;

  if (!firstName || !oldPassword || !newPassword) {
    return res.status(400).json({ message: 'Të gjitha fushat janë të detyrueshme.' });
  }

  try {
    const user = await UserModel.findOne({ firstName });

    if (!user) {
      return res.status(404).json({ message: 'Përdoruesi nuk ekziston.' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Fjalëkalimi i vjetër është gabim.' });
    }

    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    user.password = hashedNewPassword;
    await user.save();

    return res.status(200).json({ message: 'Fjalëkalimi u ndryshua me sukses!' });
  } catch (error) {
    console.error('❌ Error updating password:', error);
    return res.status(500).json({ message: 'Gabim në server.' });
  }
});

app.delete('/api/user/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedUser = await UserModel.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'Përdoruesi nuk u gjet për fshirje.' });
    }

    res.status(200).json({ message: 'Llogaria u fshi me sukses!' });
  } catch (error) {
    console.error('❌ Gabim:', error);
    res.status(500).json({ message: 'Gabim gjatë fshirjes së llogarisë.' });
  }
});

app.get('/api/barcode/:code', (req, res) => {
  const code = req.params.code;
  
  if (!/^\d{12}$/.test(code)) {  // Validate that it's a 12-digit number
    return res.status(400).send('Kodi duhet të ketë saktësisht 12 numra.');
  }

  const canvas = createCanvas();
  try {
    JsBarcode(canvas, code, {
      format: 'EAN13',
      displayValue: true,
      width: 2,
      height: 100,
    });

    res.set('Content-Type', 'image/png');
    canvas.createPNGStream().pipe(res); // Serve the barcode image as PNG
  } catch (err) {
    console.error('❌ Error generating barcode:', err);
    res.status(500).send('Gabim gjatë gjenerimit të barkodit.');
  }
});

app.get('/api/user-count-by-date', async (req, res) => {
  try {
    const { filter } = req.query;
    let matchStage = {};

    const now = new Date();
    if (filter === 'last30days') {
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      matchStage = { createdAt: { $gte: thirtyDaysAgo } };
    } else if (filter === 'thismonth') {
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      matchStage = { createdAt: { $gte: firstDayOfMonth } };
    }

    const result = await UserModel.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const total = await UserModel.countDocuments(matchStage);

    res.status(200).json({ data: result, total });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ message: 'Gabim në server.' });
  }
});

