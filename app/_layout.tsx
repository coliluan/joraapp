import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function RootLayout() {
    const { t } = useTranslation();
  
  return (
    <Stack initialRouteName="onboarding" >
      <Stack.Screen options={{ headerShown: false }}  name="onboarding"  />
      <Stack.Screen options={{ headerShown: false }}  name="index"   />
      <Stack.Screen options={{ headerShown: false }}  name="(tabs)" />
      <Stack.Screen options={{ 
         title: t('logIn'),
         headerShown: true,
         headerTitleAlign: 'center',
         headerTintColor: '#171717',
         headerTitleStyle: { fontWeight: '500' },
         gestureEnabled: true,
         headerBackVisible: true, // titulli ne app bar left
        headerBackTitle: '',  // titulli ne app bar left
        }}  
         name="(auth)/logIn" />
      <Stack.Screen 
      options={{
        title: t('register'),
        headerShown: true,
        headerTitleAlign: 'center',
        headerTintColor: '#171717',
        headerTitleStyle: { fontWeight: '500' },
        gestureEnabled: true,
        headerBackVisible: true, // titulli ne app bar left
        headerBackTitle: '',  // titulli ne app bar left
        }}  
        name="(auth)/registired" />
      <Stack.Screen options={{ 
        title: 'Ndrysho Profilin',
        headerShown: true,
        headerTitleAlign: 'center',
        headerTintColor: '#171717',
        headerTitleStyle: { fontWeight: '500' },
        gestureEnabled: true,
        headerBackVisible: false,
        // animation: 'slide_from_bottom',
        headerBackTitle: '',
         }}  name="(auth)/profile/edit_screen"/>
      <Stack.Screen options={{
          title: t('placeHolder'),
          headerShown: true,
          headerTitleAlign: 'center',
          headerTintColor: '#171717',
          headerTitleStyle: { fontWeight: '500' },
          gestureEnabled: true,
          headerBackVisible: false, // titulli ne app bar left
          headerBackTitle: '',  // titulli ne app bar left
        }}  name="(auth)/profile/password"/>
      <Stack.Screen options={{ 
         title: t('profile.lang'),
         headerShown: true,
         headerTitleAlign: 'center',
         headerTintColor: '#171717',
         headerTitleStyle: { fontWeight: '500' },
         gestureEnabled: true,
         headerBackVisible: false, // titulli ne app bar left
         headerBackTitle: '',  // titulli ne app bar left
       }}  name="(auth)/profile/language"/>
    </Stack>
  );
}
