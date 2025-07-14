// models/NotificationModel.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  title: String,
  body: String,
  sentAt: {
    type: Date,
    default: Date.now,
  },
});

const NotificationModel = mongoose.model('notifications', notificationSchema);
export default NotificationModel;
