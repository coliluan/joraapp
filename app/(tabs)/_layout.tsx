import { Tabs } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image } from 'react-native';

const Layout = () => {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#eb1c24',
          height: 120,
        },
        headerTitle: () => (
          <Image
            source={require('../../assets/images/jora-header.png')}
            style={{ width: 200 }}
            resizeMode="contain"
          />
        ),
        tabBarStyle: {
          backgroundColor: '#eb1c24',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          position: 'absolute',
          overflow: 'hidden',
          height: 70,
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
      <Tabs.Screen
        name="shop"
        options={{
          title: 'E-Shop',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/images/shopping.png')}
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
      <Tabs.Screen name="profile/language" options={{ href: null }} />
      <Tabs.Screen name="profile/delete_account" options={{ href: null }} />
      <Tabs.Screen name="components/notificationModal" options={{ href: null }} />
    </Tabs>
  );
};

export default Layout;
