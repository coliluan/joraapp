import { globalStyles } from '@/assets/globalStyles';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import i18n from '../../language/index';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 45,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(250, 250, 250, 1)',
    gap: 24.5,
  },
});

const Language = () => {
  const { t } = useTranslation();

  const locales = [
    { tag: 'al', name: 'Shqip' },
    { tag: 'en', name: 'English' },
  ];

  const [selected, setSelected] = useState(locales[0]);

  useEffect(() => {
    const currentLocale = i18n.language;
    const current = locales.find(l => l.tag === currentLocale);
    if (current) setSelected(current);
  }, []);

  const handleLanguageChange = (locale: { tag: string; name: string }) => {
    i18n.changeLanguage(locale.tag);
    setSelected(locale);
  };
  

  return (
    <View style={styles.container}>
      <TouchableOpacity style={globalStyles.input} onPress={() => handleLanguageChange({ tag: 'al', name: 'Shqip' })}>
        <Text>{t('languages.al')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={globalStyles.input} onPress={() => handleLanguageChange({ tag: 'en', name: 'English' })}>
        <Text>{t('languages.en')}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Language;
