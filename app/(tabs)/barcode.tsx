import React, { useEffect } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { ENDPOINTS, getApiUrl } from '../../config/api';
import LoginModal from '../components/loginModal';
import { useUserStore } from '../store/useUserStore';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(250, 250, 250, 1)',
  },
  image: {
    width: 620,
    height: 150,
    transform: [{ rotate: '270deg' }],
    backgroundColor: 'transparent',
  },
});

const Barcode = () => {
  const { user, isLoggedIn, loadUserFromStorage } = useUserStore();

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const barcodeUrl = user?.barcode ? getApiUrl(ENDPOINTS.BARCODE(user.barcode)) : '';

  return (
    <View style={styles.container}>
      {isLoggedIn && user?.barcode ? (
        <Image source={{ uri: barcodeUrl }} style={styles.image} />
      ) : (
        <Text>Barcode not available</Text>
      )}

      {!isLoggedIn && <LoginModal />}
    </View>
  );
};

export default Barcode;

