import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import LanguageProvider from '../app/language/LanguageProvider';

export default function RootLayout() {
  const { t } = useTranslation();

  return (
    <LanguageProvider>
      <Stack initialRouteName="onboarding">
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

    </Stack>
    </LanguageProvider>
    
  );
}
