import { Expo } from 'expo-server-sdk';

const expo = new Expo();

import fetch from 'node-fetch'; // Nëse nuk e ke të instaluar: `npm install node-fetch`

async function sendPushNotification(expoPushToken, title, body) {
  const message = {
    to: expoPushToken,
    sound: 'default', // Aktivizon zërin
    title: title,
    body: body,
    priority: 'high',
    data: {
      extraData: 'Any custom data here',
    },
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

    const result = await response.json();
    console.log('📬 Notification response:', result);
  } catch (error) {
    console.error('❌ Error sending push notification:', error);
  }
}

