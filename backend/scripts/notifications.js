import express from 'express';
import Notification from './notifications'; // or wherever it's located
const router = express.Router();

router.post('/notify', async (req, res) => {
  const { title, body } = req.body;

  if (!title || !body) {
    return res.status(400).json({ message: 'Title and body are required' });
  }

  try {
    // Save to DB
    const notification = new Notification({ title, body });
    await notification.save();

    // (Optional) send push notification logic here

    res.status(200).json({ message: 'Notification sent and saved', notification });
  } catch (error) {
    console.error('Notification error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
