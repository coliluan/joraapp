import { Expo } from 'expo-server-sdk';
import express from 'express';
import NotificationModel from '../models/Notification.model.js';
import UserModel from '../models/User.model.js';

const notifyRouter = express.Router();

notifyRouter.post('/', async (req, res) => {
  try {
    const { title, body } = req.body;

    const users = await UserModel.find({ expoPushToken: { $exists: true } });
    const expo = new Expo();

    const messages = [];

    const uniqueTokens = new Set();

    for (const user of users) {
      const pushToken = user.expoPushToken;
      if (Expo.isExpoPushToken(pushToken) && !uniqueTokens.has(pushToken)) {
        uniqueTokens.add(pushToken);
        messages.push({
          to: pushToken,
          sound: 'default',
          title,
          body,
        });
      }
    }

    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];

    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    }

    // Ruaj njoftimin në MongoDB
    const newNotification = await NotificationModel.create({ title, body });

    return res.status(200).json({
      message: `Notifikimi u dërgua te ${uniqueTokens.size} pajisje.`,
      tickets,
      notification: newNotification,
    });

  } catch (error) {
    console.error('❌ Gabim gjatë dërgimit të njoftimit:', error);
    return res.status(500).json({ message: 'Gabim i brendshëm i serverit' });
  }
});

export default notifyRouter;
