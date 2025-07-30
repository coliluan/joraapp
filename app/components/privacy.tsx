import { t } from 'i18next';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

type BulletListProps = {
  items: string[];
};

const BulletList: React.FC<BulletListProps> = ({ items }) => (
  <View style={styles.list}>
    {items.map((item, idx) => (
      <Text key={idx} style={styles.listItem}>
        {'\u2022'} {item}
      </Text>
    ))}
  </View>
);

const Privacy = () => {
  // Get the sections from the translation, default to empty array if not found
  const sections = t('privacy.sections', { returnObjects: true }) as { 
    title: string; 
    content: string; 
    list?: string[]; 
  }[] || [];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.content}>{t('privacy.header')}</Text>
        <Text style={styles.title}>{t('privacy.appName')}</Text>
        <Text style={styles.content}>{t('privacy.intro')}</Text>
      </View>

      {/* Check if sections exist before rendering */}
      {sections.length > 0 ? (
        sections.map((section, idx) => (
          <View key={idx} style={styles.textContainer}>
            <Text style={styles.title}>{section.title}</Text>
            <Text style={styles.content}>{section.content}</Text>
            {section.list && <BulletList items={section.list} />}
          </View>
        ))
      ) : (
        <Text style={styles.content}>No privacy sections found.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#FAFAFA',
    padding: 16,
    gap: 20,
  },
  textContainer: {
    backgroundColor: '#EB2328',
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 20,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginVertical: 12,
    textAlign: 'center',
  },
  content: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    textAlign: 'center',
  },
  list: {
    marginTop: 8,
  },
  listItem: {
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'left',
    marginBottom: 6,
  },
});

export default Privacy;
