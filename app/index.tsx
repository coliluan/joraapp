import { globalStyles } from '@/assets/globalStyles';
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

  // Animacioni i onboarding
  useEffect(() => {
    const startOnboarding = async () => {
      setTimeout(() => {
        opacity.value = withTiming(0, { duration: 800 }, (finished) => {
          if (finished) {
            runOnJS(checkLoginStatus)(); // kontrollon login pas animacionit
          }
        });
      }, 2000);
    };

    startOnboarding();
  }, []);

  // Kontrollo login-in pasi përfundon onboarding
  const checkLoginStatus = async () => {
    try {
      const user = await AsyncStorage.getItem('loggedInUser');
      if (user) {
        router.replace('/(tabs)/home'); // shko direkt në home
      } else {
        setShowMain(true); // shfaq butonat login/register
      }
    } catch (e) {
      setShowMain(true); // në rast errori, vazhdo në onboarding screen
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
            <View style={styles.topVisitor}>
              <TouchableOpacity onPress={() => router.replace('/(tabs)/home')}>
                <Text style={styles.visitor}>Vazhdo si mysafir</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.container}>
              <Text style={styles.welcome}>{t('index.title')}</Text>
              <View style={styles.logoContainer}>
                <Image
                  source={require('../assets/images/jora-logo.png')}
                  style={{ width: 351, height: 49 }}
                />
              </View>
              <Text style={styles.subtitle}>{t('index.text')}</Text>
            </View>
            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={() => router.push('/registired')}
                style={globalStyles.registerButton}
                labelStyle={styles.buttonText}
              >
                {t('index.register')}
              </Button>
              <Button
                mode="outlined"
                onPress={() => router.push('/logIn')}
                style={styles.logButton}
                labelStyle={[styles.buttonText, { color: '#D32F2F' }]}
              >
                {t('logIn')}
              </Button>
            </View>

            <View style={styles.customVisitor}>
              <TouchableOpacity onPress={() => router.replace('/(tabs)/home')}>
                <Text style={styles.visitor}>Vazhdo si mysafir</Text>
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
    backgroundColor: '#FAFAFA',
  },
  onboardingContainer: {
    flex: 1,
    backgroundColor: '#FF3D00',
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
    backgroundColor: '#FAFAFA',
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
    fontSize: 16,
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 20,
  },
  welcome: {
    fontSize: 25,
    marginBottom: 10,
    color: 'rgba(23, 23, 23, 1)',
    fontWeight: '500',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 18,
    color: '#171717',
    marginBottom: 40,
    fontWeight: '500',
    paddingHorizontal: 61,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
    backgroundColor: '#FAFAFA',
  },
  logButton: {
    borderColor: '#D32F2F',
    width: 180,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 0,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '500',
    color: '#FFFFFF',
    fontFamily: 'Poppins-Regular',
  },
});
