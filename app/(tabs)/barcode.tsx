import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(250, 250, 250, 1)',
  },
  image: {
    width: 500,
    height: 150,
    transform: [{ rotate: '270deg' }],
    backgroundColor:'none'
  },
});

const Barcode = () => {

  const [barcode, setBarcode] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const jsonValue = await AsyncStorage.getItem('loggedInUser');
      if (jsonValue) {
        const user = JSON.parse(jsonValue);
        setBarcode(user.barcode); // Set barcode to the state
      }
    };

    fetchUser();
  }, []);

  const barcodeUrl = `https://joracenterapp-3.onrender.com/api/barcode/${barcode}`;


  return (
    <View style={styles.container}>
    {barcode ? (
      <Image source={{ uri: barcodeUrl }} style={styles.image} />
    ) : (
      <Text>Loading Barcode...</Text>
    )}
  </View>
  );
};

export default Barcode;
