import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';

const OnboardingScreen = () => {

  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('./index'); 
    }, 3000); 
    return () => clearTimeout(timer);
  }, [router]);


  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/jora-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 250,
    height: 80,
  },
});
