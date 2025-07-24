import { globalStyles } from '@/assets/globalStyles';
import { router } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useUserStore } from '../store/useUserStore';

const App = () => {
const user = useUserStore(state => state.user);

  const { t } = useTranslation();
  
  const locations = [
  {
    title: 'Jora Center - Komoran',
    address: t('location.highway'),
    image: require('../../assets/images/location2.png'),
    mapUrl: 'https://maps.app.goo.gl/Dz8LTsW15ZDhdQmc8',
  },
  {
    title: 'Jora Center - Sllatinë',
    address: t('location.highway1'),
    image: require('../../assets/images/location1.png'), 
    mapUrl: 'https://maps.app.goo.gl/CFp3ecmjoWXvSZnY7',
  },
];
  
  return (
    <ScrollView style={styles.container}>
      <View style={globalStyles.notification}>
        <TouchableOpacity 
        onPress={() => {
           if (!user?.isGuest && user?.firstName) {
             router.push('/components/notificationModal');
           }
         }}
         disabled={user?.isGuest || !user?.firstName}>
          <Image source={require('../../assets/images/notification.png')} />
        </TouchableOpacity>
      </View>

      <Text style={styles.header}>{t('location.store')}</Text>
      {locations.map((location, index) => (
        <View key={index} style={styles.card}>
          <Image source={location.image} style={styles.image} resizeMode="cover" />
          <View style={styles.cardContent}>
            <Text style={globalStyles.title}>{location.title}</Text>
            <Text style={styles.address}>{location.address}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => Linking.openURL(location.mapUrl)}
            >
              <Text style={styles.buttonText}>{t('location.map')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingVertical: 45,
    backgroundColor: '#FAFAFA',
  },
  header: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 30,
    color: '#171717'
  },
  card: {
    backgroundColor: '#fff',
    overflow: 'hidden',
    padding: 15,
    height: 270,
    marginBottom: 30
  },
  image: {
    width: '100%',
    height: 148,
    padding: 15,
    borderRadius: 5, 
    objectFit: 'cover',
  },
  cardContent: {
    gap: 5
  },
  address: {
    color: '#rgba(23, 23, 23, 1)',
    fontWeight: '400',
    fontSize: 12,
    fontFamily: 'Poppins-Regular'
  },
  button: {
    backgroundColor: 'rgba(235, 35, 40, 1)',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 99,
    height:28,
  },
  buttonText: {
    color: 'rgba(255, 255, 255, 1)',
    fontWeight: '400',
    fontSize: 12,
    fontFamily: 'Poppins-Regular'
  },
});

export default App;
