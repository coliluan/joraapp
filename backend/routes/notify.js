import { Expo } from 'expo-server-sdk';
import express from 'express';
import Notification from '../../backend/models/Notification.model.js';

const router = express.Router();
const expo = new Expo();

router.post('/', async (req, res) => {
  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).json({ message: 'Titulli dhe mesazhi kërkohen.' });
  }

  try {
    const users = await User.find({ pushToken: { $exists: true, $ne: null } });
    const messages = [];

    for (let user of users) {
      if (!Expo.isExpoPushToken(user.pushToken)) continue;

      messages.push({
        to: user.pushToken,
        sound: 'default',
        title,
        body,
        data: { withSome: 'data' },
      });
    }

    const chunks = expo.chunkPushNotifications(messages);
    for (let chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk);
    }

    const notification = new Notification({ title, body });
    await notification.save();

    return res.status(200).json({ message: 'Njoftimi u dërgua dhe u ruajt.', notification });
  } catch (error) {
    console.error('Gabim në dërgimin e njoftimit:', error);
    return res.status(500).json({ message: 'Gabim i brendshëm i serverit' });
  }
});

router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ sentAt: -1 });
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: 'Gabim në marrjen e njoftimeve.' });
  }
});

export default router; // ✅ Eksporto si ES module
