import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const History = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Historiku i Jora Center</Text>
        <Text style={styles.content}>
          Jora Center është një qendër tregtare moderne që operon me sukses për më shumë se një dekadë,
          me lokacione në Komoran dhe Sllatinë të Madhe. E themeluar me vizionin për të krijuar një hapësirë
          multifunksionale për blerje, ushqim dhe relaksim, Jora Center është kthyer në një pikë të rëndësishme
          tregtare për komunitetin lokal dhe më gjerë. Qendra ofron një supermarket me produkte të freskëta,
          restorant me kuzhinë të pasur, kafene të ngrohta dhe dyqane mode bashkëkohore. Me përkushtim ndaj
          cilësisë dhe shërbimit ndaj klientit, Jora Center mbetet një zgjedhje e preferuar për mijëra vizitorë çdo ditë.
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
