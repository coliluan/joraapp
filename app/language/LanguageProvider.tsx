// components/LanguageProvider.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import i18n from '../language/index';

interface LanguageProviderProps {
  children: React.ReactNode;
}

const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initLanguage = async () => {
      try {
        const lang = await AsyncStorage.getItem('language');
        await i18n.changeLanguage(lang || 'al');
      } catch (err) {
        await i18n.changeLanguage('al');
      } finally {
        setLoading(false);
      }
    };

    initLanguage();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return children;
};

export default LanguageProvider;
