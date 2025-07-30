import React from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const History = () => {
    const { t } = useTranslation();
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{t('titleHistory')}</Text>
        <Text style={styles.content}>
          {t('textHistory')}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  textContainer: {
    backgroundColor: '#EB2328',
    borderRadius: 10,
    padding: 20,
    marginHorizontal: 12,
    paddingVertical: 60 ,
    maxWidth: '100%',
    height: 'auto',
    alignItems: 'center',
    justifyContent: 'center',

  },
  title: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  content: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    textAlign: 'center',
  },
});

export default History;
