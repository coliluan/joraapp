import { API_BASE } from '@/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, Stack, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import LanguageProvider from '../app/language/LanguageProvider';
import NotifyIcon from '../assets/images/notify.svg';

import { useIsFocused } from '@react-navigation/native';
import { useNotificationPolling } from './useNotificationPolling';

export default function RootLayout() {
  const { t } = useTranslation();
  const [notificationCount, setNotificationCount] = useState(0);
  const isFocused = useIsFocused();

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
    <LanguageProvider>
      <Stack initialRouteName="onboarding"
  screenOptions={{
    headerStyle: {
      backgroundColor: '#eb1c24',
    },
    header: () => (
      <View
        style={{
          backgroundColor: '#eb1c24',
          height: 120, 
          justifyContent: 'center',
          paddingTop: 55,
          paddingHorizontal: 20, 
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '100%',
          }}
        >
          <Image
            source={require('../assets/images/jora-header.png')}
            style={{ width: 183 }}
            resizeMode="contain"
          />
          <TouchableOpacity
            onPress={() => {
              router.push('/components/notificationModal');
            }}
            style={{ position: 'relative', }}  
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
      </View>
    ),
  }}
>


      <Stack.Screen options={{ headerShown: false }} name="onboarding" />
      <Stack.Screen options={{ 
        headerShown: false,
        gestureEnabled: false,
        }} name="index" />
      <Stack.Screen options={{ 
        headerShown: false,
        gestureEnabled: false,
        }} name="(tabs)" />
      <Stack.Screen
        options={{
          title: t('logIn'),
          headerShown: true,
          headerTitleAlign: 'center',
          headerTintColor: '#171717',
          headerTitleStyle: { fontWeight: '500' },
          gestureEnabled: true,
          headerBackVisible: false,
          headerBackTitle: '',
        }}
        name="(auth)/logIn"
      />
      <Stack.Screen
        options={{
          title: t('register'),
          headerShown: true,
          headerTitleAlign: 'center',
          headerTintColor: '#171717',
          headerTitleStyle: { fontWeight: '500' },
          gestureEnabled: true,
          headerBackVisible: false,
          headerBackTitle: '',
        }}
        name="(auth)/registired"
      />
      <Stack.Screen
        options={{
          title: 'Ndrysho Profilin',
          headerShown: true,
          headerTitleAlign: 'center',
          headerTintColor: '#171717',
          headerTitleStyle: { fontWeight: '500' },
          gestureEnabled: true,
          headerBackVisible: false,
          headerBackTitle: '',
        }}
        name="(auth)/profile/edit_screen"
      />
      <Stack.Screen
        options={{
          title: t('placeHolder'),
          headerShown: true,
          headerTitleAlign: 'center',
          headerTintColor: '#171717',
          headerTitleStyle: { fontWeight: '500' },
          gestureEnabled: true,
          headerBackVisible: false,
          headerBackTitle: '',
        }}
        name="(auth)/profile/password"
      />
      <Stack.Screen
        options={{
          title: t('profile.lang'),
          headerShown: true,
          headerTitleAlign: 'center',
          headerTintColor: '#171717',
          headerTitleStyle: { fontWeight: '500' },
          gestureEnabled: true,
          headerBackVisible: false,
          headerBackTitle: '',
        }}
        name="(auth)/profile/language"
      />
      <Stack.Screen
        options={{
          title: t('notification'),
          headerShown: true,
          headerTitleAlign: 'center',
          headerTintColor: '#171717',
          headerTitleStyle: { fontWeight: '500' },
          gestureEnabled: true,
          headerBackVisible: false,
          headerBackTitle: '',
        }}
        name="components/notificationModal"
      />
      <Stack.Screen
        options={{
          title: t('history'),
          headerShown: true,
          headerTitleAlign: 'center',
          headerTintColor: '#171717',
          headerTitleStyle: { fontWeight: '500' },
          gestureEnabled: true,
          headerBackVisible: false,
          headerBackTitle: '',
        }}
        name="components/history"
      />
      <Stack.Screen
        options={{
          title: t('services'),
          headerShown: true,
          headerTitleAlign: 'center',
          headerTintColor: '#171717',
          headerTitleStyle: { fontWeight: '500' },
          gestureEnabled: true,
          headerBackVisible: false,
          headerBackTitle: '',
        }}
        name="components/jora_services"
      />
      <Stack.Screen
        options={{
          title: '',
          headerShown: true,
          headerTitleAlign: 'center',
          headerTintColor: '#171717',
          headerTitleStyle: { fontWeight: '500' },
          gestureEnabled: true,
          headerBackVisible: false,
          headerBackTitle: '',
        }}
        name="(auth)/profile/cities"
      />
      <Stack.Screen
        options={{
          title: t('terms'),
          headerShown: true,
          headerTitleAlign: 'center',
          headerTintColor: '#171717',
          headerTitleStyle: { fontWeight: '500' },
          gestureEnabled: true,
          headerBackVisible: false,
          headerBackTitle: '',
        }}
        name="components/privacy"
      />
      <Stack.Screen
        options={{
          title: 'Favorites',
          headerShown: true,
          headerTitleAlign: 'center',
          headerTintColor: '#171717',
          headerTitleStyle: { fontWeight: '500' },
          gestureEnabled: true,
          headerBackVisible: false,
          headerBackTitle: '',
        }}
        name="components/favorite_product"
      />
      <Stack.Screen
        options={{
          title: '',
          headerShown: true,
          headerTitleAlign: 'center',
          headerTintColor: '#171717',
          headerTitleStyle: { fontWeight: '500' },
          gestureEnabled: true,
          headerBackVisible: false,
          headerBackTitle: '',
        }}
        name="components/store"
      />
      <Stack.Screen
        options={{
          title: 'payment method',
          headerShown: true,
          headerTitleAlign: 'center',
          headerTintColor: '#171717',
          headerTitleStyle: { fontWeight: '500' },
          gestureEnabled: true,
          headerBackVisible: false,
          headerBackTitle: '',
        }}
        name="components/payment"
      />
    </Stack>
    </LanguageProvider>
    
  );
}
