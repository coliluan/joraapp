// app/onboarding.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';

export default function OnboardingScreen() {
  const router = useRouter();

  useEffect(() => {
    const showOnboarding = async () => {
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5 seconds
      await AsyncStorage.setItem('hasSeenOnboarding', 'true');
      router.replace('./index');
    };

    showOnboarding();
  }, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/jora-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EB2328',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 250,
    height: 80,
  },
});
