import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button, PaperProvider } from 'react-native-paper';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export default function App() {
  const router = useRouter();
  const { t } = useTranslation();
  const [showMain, setShowMain] = useState(false);
  const [checkingLogin, setCheckingLogin] = useState(true);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const startOnboarding = async () => {
      setTimeout(() => {
        opacity.value = withTiming(0, { duration: 800 }, (finished) => {
          if (finished) {
            runOnJS(checkLoginStatus)();
          }
        });
      }, 2000);
    };

    startOnboarding();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const user = await AsyncStorage.getItem('loggedInUser');
      if (user) {
        router.replace('/(tabs)/home');
      } else {
        setShowMain(true); 
      }
    } catch (e) {
      setShowMain(true); 
    } finally {
      setCheckingLogin(false);
    }
  };

  const onboardingStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  if (checkingLogin) {
    return (
      <Animated.View style={[styles.onboardingContainer, onboardingStyle]}>
        <Image
          source={require('../assets/images/jora-onboarding.png')}
          style={styles.onboardingLogo}
          resizeMode="contain"
        />
      </Animated.View>
    );
  }

  if (showMain) {
    return (
      <PaperProvider>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.wrapper}>
            <View style={styles.container}>
              <Text style={styles.welcome}>{t('index.title')}</Text>
              <View style={styles.logoContainer}>
                <Image style={styles.image}
                  source={require('../assets/images/jora-onboarding.png')}
                  
                />
              </View>
            </View>
            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={() => router.push('/registired')}
                style={styles.buttons}
                labelStyle={styles.buttonText}
              >
                {t('index.register')}
              </Button>
              <Button
                mode="outlined"
                onPress={() => router.push('/logIn')}
                style={styles.buttons}
                labelStyle={[styles.buttonText, { color: '#D32F2F' }]}
              >
                {t('logIn')}
              </Button>
            </View>

            <View style={styles.customVisitor}>
              <TouchableOpacity onPress={() => router.replace('/(tabs)/home')}>
                <Text style={styles.visitor}>{t('index.guests')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </PaperProvider>
    );
  }
  return null;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eb1c24',
  },
  onboardingContainer: {
    flex: 1,
    backgroundColor: '#eb1c24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onboardingLogo: {
    width: 250,
    height: 80,
    transform: [{ scale: 1 }],
  },
  wrapper: {
    flex: 1,
    paddingBottom: 124,
    backgroundColor: '#eb1c24',
  },
  topVisitor: {
    alignItems: 'flex-end',
    padding: 20,
  },
  customVisitor: {
    alignItems: 'center',
    paddingBottom: 20,
    marginTop: 20,
  },
  visitor: {
    fontSize: 12,
    color: '#fff',
    textDecorationLine: 'underline',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  welcome: {
    fontSize: 25,
    marginBottom: 30,
    color: 'rgba(23, 23, 23, 1)',
    fontWeight: '500',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '100%',
    maxWidth: 250
  },
  image: {
    width: '100%', 
    objectFit: 'contain'
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
  },
  buttons:{
    backgroundColor:'#FFFFFF',
    width: 180,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#eb1c24',
    fontFamily: 'Poppins-Regular',
  },
});
