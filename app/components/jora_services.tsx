import { t } from 'i18next';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const Services = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{t('titleServices')}</Text>
        <Text style={styles.content}>
          {t('textServices')}
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
    maxWidth: '90%',
  },
  title: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  content: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    textAlign: 'center',
  },
});

export default Services;
