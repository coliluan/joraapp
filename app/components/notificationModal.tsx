import React, { useEffect, useState } from 'react';
import { Image, Linking, ScrollView, StyleSheet, Text } from 'react-native';
import { Card, IconButton } from 'react-native-paper';
import { API_BASE } from '../config/api'; // Make sure this points to your backend

interface Notification {
  title: string;
  body: string;
  sentAt: string;
}

const NotificationModal = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const loadNotifications = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/notifications`);
    const data = await response.json();

    if (Array.isArray(data)) {
      setNotifications(data); // ✅
    } else {
      console.warn('Data nuk është një array:', data);
      setNotifications([]);
    }
  } catch (error) {
    console.error('Gabim gjatë marrjes së njoftimeve:', error);
    setNotifications([]); // fallback bosh për të shmangur .map crash
  }
};


    loadNotifications();
  }, []);

  return (
    <ScrollView style={styles.container}>
      {notifications.map((notif, index) => (
        <Card key={index} style={styles.card}>
          <Card.Title
            title={notif.title}
            subtitle={`${notif.body}\n${new Date(notif.sentAt).toLocaleString()}`}
            left={() => (
        <Image
          source={require('../../assets/images/notification.png')}
          style={styles.notificationIcon}
        />
      )}
            right={(props) => <IconButton {...props} 
            onPress={() => Linking.openURL('https://www.facebook.com/share/18yHT7VRxr/?mibextid=wwXIfr')}
            icon="dots-vertical" />}
          />
        </Card>
      ))}

      {notifications.length === 0 && (
        <Text style={styles.emptyText}>Nuk ka njoftime të ruajtura.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fafafa',
  },
  card: {
    marginBottom: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
  },
  notificationIcon: {
  width: 40,
  height: 40,
  borderRadius: 20,
  marginRight: 8,
},
});

export default NotificationModal;
