import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Bell from '../../assets/images/bell.svg';
import Cross from '../../assets/images/cross.svg';
import { API_BASE, API_CONFIG } from '../../config/api';
interface Notification {
  title: string;
  body: string;
  sentAt: string;
}

const fetchJsonWithFallback = async (path: string) => {
  try {
    const res = await fetch(`${API_BASE}${path}`);
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      throw new Error(`Non-JSON response: ${text.slice(0, 100)}`);
    }
    return res.json();
  } catch (e) {
    const resProd = await fetch(`${API_CONFIG.PRODUCTION}${path}`);
    const contentType = resProd.headers.get('content-type') || '';
    if (!resProd.ok || !contentType.includes('application/json')) {
      const text = await resProd.text();
      throw new Error(`Fallback failed: HTTP ${resProd.status} ${text.slice(0, 120)}`);
    }
    return resProd.json();
  }
};

const NotificationModal = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await fetchJsonWithFallback('/api/notifications');

        if (Array.isArray(data)) {
          setNotifications(data);
          await AsyncStorage.setItem('lastSeenNotificationCount', data.length.toString());
        } else {
          console.warn('Data nuk është një array:', data);
          setNotifications([]);
        }
      } catch (error) {
        console.error('Gabim gjatë marrjes së njoftimeve:', error);
        setNotifications([]);
      }
    };

    loadNotifications();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.topSection}>
        <View>
          <Text style={styles.titleSection}>Njoftime</Text>
        </View>
        <View>
          <Cross width={16} height={16} />
        </View>
      </View>
      
      {notifications.map((notif, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.item, index === 0 && styles.itemActive]}
          activeOpacity={0.8}
        >
          <View style={styles.iconWrapper}>
            <Bell width={15} height={15} />
          </View>
          <View style={styles.textWrapper}>
            <Text style={styles.title}>{notif.title || 'Titulli'}</Text>
            <Text style={styles.subtitle}>{notif.body || 'Përshkrimi'}</Text>
          </View>
        </TouchableOpacity>
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
    backgroundColor: '#fff',
  },
  topSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop:40,
    marginBottom: 27,
  },
  titleSection: {
    fontSize: 18,
    fontWeight: '500',
    color: '#111',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  itemActive: {
    backgroundColor: '#FFF1F2',
    height: 72,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF2F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    fontWeight: '600',
    fontSize: 15,
    color: '#111',
  },
  subtitle: {
    fontSize: 13,
    color: '#555',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
  },
});

export default NotificationModal;
