import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { router, Tabs, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import NotifyIcon from '../../assets/images/notify.svg';
import ShoppingCart from '../../assets/images/shopping-cart.svg';
import { API_BASE } from '../../config/api';
import { useNotificationPolling } from '../useNotificationPolling';

const Layout = () => {
  const { t } = useTranslation();
  const [notificationCount, setNotificationCount] = useState(0);
  const isFocused = useIsFocused();

  // Fetch the notification count from the backend
const fetchNotificationCount = useCallback(async () => {
    try {
             const res = await fetch(`${API_BASE}/api/notifications`);
      const contentTypeNotif = res.headers.get('content-type') || '';
      if (!res.ok || !contentTypeNotif.includes('application/json')) {
        throw new Error(`Invalid response from ${API_BASE}/api/notifications`);
      }
      const data = await res.json();
      const lastSeen = parseInt(await AsyncStorage.getItem('lastSeenNotificationCount') || '0');
      setNotificationCount(Array.isArray(data) ? Math.max(data.length - lastSeen, 0) : 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, []);

  useFocusEffect(
      React.useCallback(() => {
        fetchNotificationCount();
      }, [fetchNotificationCount])
    );

     useNotificationPolling(() => {
        if (isFocused) fetchNotificationCount();
      }, 5000);

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#eb1c24',
          height: 120,
        },
        headerTitle: () => (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: '100%',
              justifyContent: 'space-between',
            }}
          >
            <Image
              source={require('../../assets/images/jora-header.png')}
              style={{ width: 183 }}
              resizeMode="contain"
            />
            <TouchableOpacity
              onPress={() => {
                router.push('/components/notificationModal');
              }}
              style={{ position: 'relative' }}  
            >
              <NotifyIcon />
              {notificationCount > 0 && (
                <View
                  style={{
                    position: 'absolute',
                    top: -6.5,
                    left: 13,
                    backgroundColor: 'white',
                    borderRadius: 10,
                    width: 12,
                    height: 12,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: '#000000',
                      fontSize: 6,
                      fontWeight: 'bold',
                    }}
                  >
                    {notificationCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        ),
        tabBarStyle: {
          backgroundColor: '#eb1c24',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: 'absolute',
          overflow: 'hidden',
          height: 95,
        },
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#fff',
        tabBarInactiveTintColor: '#fff',
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('appBar.home'),
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('../../assets/images/home-icon2.png')
                  : require('../../assets/images/home-icon.png')
              }
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="barcode"
        options={{
          title: t('appBar.barcode'),
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('../../assets/images/barcode-icon2.png')
                  : require('../../assets/images/barcode-icon.png')
              }
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="location"
        options={{
          title: t('appBar.store'),
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('../../assets/images/location-icon2.png')
                  : require('../../assets/images/location-icon.png')
              }
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'E-Shop',
          tabBarIcon: ({ focused }) => (
            <ShoppingCart width={24} height={24} fill="#fff" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('appBar.profile'),
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('../../assets/images/user-icon2.png')
                  : require('../../assets/images/user-icon.png')
              }
              style={{ width: 24, height: 24 }}
              resizeMode="contain"
            />
          ),
        }}
      />
      

      {/* Hidden Screens */}
      <Tabs.Screen name="profile/edit_screen" options={{ href: null }} />
      <Tabs.Screen name="profile/cities" options={{ href: null }} />
      <Tabs.Screen name="profile/password" options={{ href: null }} />
      <Tabs.Screen name="profile/location_address" options={{ href: null }} />
      <Tabs.Screen name="profile/language" options={{ href: null }} />
      <Tabs.Screen name="profile/delete_account" options={{ href: null }} />
      <Tabs.Screen name="components/notificationModal" options={{ href: null }} />
    </Tabs>
  );
};

export default Layout;
