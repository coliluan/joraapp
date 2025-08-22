import { globalStyles } from '@/assets/globalStyles';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Left from '../../../assets/images/left-side.svg';
import i18n from '../../language/index';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 45,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(250, 250, 250, 1)',
    gap: 24.5,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    marginRight: 20,
  },
  titleContainer: {
    flex: 1,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F1F1F',
    textAlign: 'center',
  },
  containerStyle: {
    margin:10,
    borderWidth:0.5,
    borderColor: '#EB2328',
    padding: 20,
    borderRadius: 5,
    backgroundColor: '#FAFAFA',
    gap:30,
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
      <View style={styles.topSection}>
          <TouchableOpacity style={styles.iconContainer}>
            <Left fill={'#EB2328'} width={24} height={24} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerText}>Gjuha</Text>
          </View>
        </View>
        <View style={styles.containerStyle}>
          <TouchableOpacity style={globalStyles.input} onPress={() => handleLanguageChange({ tag: 'al', name: 'Shqip' })}>
        <Text>{t('languages.al')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={globalStyles.input} onPress={() => handleLanguageChange({ tag: 'en', name: 'English' })}>
        <Text>{t('languages.en')}</Text>
      </TouchableOpacity>
        </View>
      
    </View>
  );
};

export default Language;
