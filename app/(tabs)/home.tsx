import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  FlatList,
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

type Offer = {
  id: string;
  title: string;
  date: string;
  image: ImageSourcePropType;
};

const HomeScreen = () => {
  const { t } = useTranslation();

  const offers: Offer[] = Array.from({ length: 8 }, (_, index) => ({
    id: `${index + 1}`,
    title: t('home.offerTitle'),
    date: '21–23 Shkurt 2025',
    image: require('../../assets/images/fletushka.png'),
  }));

  const [userName, setUserName] = useState('');
  const [number, setNumber] = useState('');
  const [role, setRole] = useState<string>(''); 
  const [barcode, setBarcode] = useState('');

  useEffect(() => {
    const loadUserName = async () => {
      try {
        const userData = await AsyncStorage.getItem('loggedInUser');
        if (userData) {
          const parsed = JSON.parse(userData);
          setUserName(parsed.firstName);
          setNumber(parsed.number);
          setBarcode(parsed.barcode);
        }
      } catch (error) {
        console.error('Error loading user name:', error);
      }
    };

    loadUserName();
  }, []);


  const renderItem = ({ item }: { item: Offer }) => (
    <View style={styles.card}>
      <Image source={item.image} style={styles.cardImage} resizeMode="cover" />
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardDate}>{item.date}</Text>
    </View>
  );

  const barcodeUrl = `http://192.168.50.173:3000/api/barcode/${barcode}`;

  return (
    <FlatList
      data={offers}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={2}
      contentContainerStyle={styles.scrollContainer}
      ListHeaderComponent={
        <>
          <View style={styles.notification}>
            <TouchableOpacity onPress={() => alert('Notifications clicked!')}>
              <Image source={require('../../assets/images/notification.png')} />
            </TouchableOpacity>
          </View>

          <View style={styles.header}>
            <Text style={styles.greeting}>
              {t('home.title')} <Text style={styles.name}>{userName}</Text>,
            </Text>
            <Text style={styles.phone}>{number}</Text>
          </View>
          <Image source={{ uri: barcodeUrl }} style={styles.barcode} />

          <Text style={styles.sectionTitle}>{t('home.sectionTitle')}</Text>
        </>
      }
      ListFooterComponent={
        role === 'admin' ? ( // Only show the button for admins
          <View style={styles.button}>
            <Button title="Admin Button" onPress={() => alert('Admin action')} />
          </View>
        ) : null
      }
    />
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 45,
    paddingBottom: 65,
    backgroundColor: '#FAFAFA',
  },
  notification: {
    alignItems: 'flex-end',
    marginBottom: 15,
  },
  button :{
    backgroundColor:'red',
    width: '100%'
  },
  header: {
    marginBottom: 27,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '500',
    color: '#171717',
    fontFamily: 'Poppins',
  },
  name: {
    color: '#EB2328',
    fontWeight: '500',
    fontFamily: 'Poppins',
    fontSize: 18,
  },
  phone: {
    color: '#171717',
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Poppins-Regular',
  },
  barcode: {
    width: '100%',
    height: 60,
    marginBottom: 41,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#171717',
    marginBottom: 15,
  },
  card: {
    flex: 1,
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
  },
  cardImage: {
    width: '100%',
    height: 217,
    borderRadius: 5,
  },
  cardTitle: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: '500',
    color: '#171717',
    textAlign: 'left',
    width: '100%',
  },
  cardDate: {
    fontSize: 10,
    color: '#EB2328',
    textAlign: 'left',
    width: '100%',
  },
});

export default HomeScreen;
