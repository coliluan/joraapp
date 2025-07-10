// index.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Button, PaperProvider } from 'react-native-paper';
import i18n from './language';

export default function App() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initialize = async () => {
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      if (!hasSeenOnboarding) {
        router.replace('/onboarding');
        return;
      }

      const userToken = await AsyncStorage.getItem('userToken');
      if (userToken) {
        router.replace('/(tabs)/home');
      } else {
        if (i18n.isInitialized) {
          setIsReady(true);
        } else {
          i18n.on('initialized', () => {
            setIsReady(true);
          });
        }
      }
    };

    initialize();
  }, []);

  if (!isReady) return null;

  return (
    <PaperProvider>
      <View style={styles.wrapper}>
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
            style={styles.registeredButton}
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
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    paddingBottom: 124,
    backgroundColor: '#FAFAFA',
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
  registeredButton: {
    backgroundColor: '#D32F2F',
    width: 180,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 0,
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
