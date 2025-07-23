import { globalStyles } from '@/assets/globalStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, Dialog } from 'react-native-paper';
import { ENDPOINTS, getApiUrl } from '../../config/api';
import { useUserStore } from '../store/useUserStore'; // ✅ import store

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
    backgroundColor: 'transparent',
  },
  passwordInput: {
    flex: 1,
    fontSize: 18,
    color: '#000',
  },
  eyeIcon: {
    width: 20,
    height: 20,
    tintColor: '#999',
  },
  custom: {
    gap: 20,
  },
  input: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 5,
    alignItems: 'center',
    height: 40,
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 18,
  },
});

const Barcode = () => {
  const { t } = useTranslation();
  const [secondDialogVisible, setSecondDialogVisible] = useState(true);
  const [formData, setFormData] = useState({ firstName: '', password: '' });
  const [passwordVisible, setPasswordVisible] = useState(false);

  const { user, setUser } = useUserStore(); // ✅ Zustand hook

  useEffect(() => {
    const loadUserFromStorage = async () => {
      const jsonValue = await AsyncStorage.getItem('loggedInUser');
      if (jsonValue) {
        const user = JSON.parse(jsonValue);
        setUser(user);
      }
    };

    loadUserFromStorage();
  }, []);


  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const barcodeUrl = user?.barcode ? getApiUrl(ENDPOINTS.BARCODE(user.barcode)) : '';

  const handleLogin = async () => {
    try {
      const response = await fetch(getApiUrl(ENDPOINTS.LOGIN), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert('Gabim', data.message || 'Kredencialet janë të pasakta');
      } else {
        await AsyncStorage.setItem('loggedInUser', JSON.stringify(data.user));
        setUser(data.user); // ✅ Zustand state
        Alert.alert('Sukses', 'Jeni identifikuar me sukses');
      }
    } catch (error) {
      Alert.alert('Gabim', 'Nuk u lidh me serverin');
      console.error('Login error:', error);
    }
  };


  return (
    <View style={styles.container}>
      {user?.barcode ? (
        <Image source={{ uri: barcodeUrl }} style={styles.image} />
      ) : secondDialogVisible ? null : (
        <Text>Loading Barcode...</Text>
      )}

      <Dialog
        style={globalStyles.modal}
        visible={secondDialogVisible}
        dismissable={false}
      >
        <Dialog.Icon icon="alert" />
        <Dialog.Title style={globalStyles.dialogTitle}>
          Ju lutem identifikohuni
        </Dialog.Title>
        <Dialog.Content>
          <View style={styles.custom}>
            <TextInput
              style={styles.input}
              placeholder={t('name')}
              placeholderTextColor="#1F1F1F"
              value={formData.firstName}
              onChangeText={(text) => handleInputChange('firstName', text)}
            />
            <View style={styles.input}>
              <TextInput
                style={styles.passwordInput}
                placeholder={t('placeHolder')}
                secureTextEntry={!passwordVisible}
                placeholderTextColor="#1F1F1F"
                value={formData.password}
                onChangeText={(text) => handleInputChange('password', text)}
              />
              <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                <Image
                  source={require('../../assets/images/eyeIcon.png')}
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
        </Dialog.Content>

        <Dialog.Actions>
          <Button
            style={globalStyles.dialogButton}
            onPress={() => router.push('/registired')}
            mode="contained"
            labelStyle={{ color: '#fff' }}
          >
            Register
          </Button>
          <Button
            style={globalStyles.buttonDialog}
            mode="contained"
            labelStyle={{ color: '#fff' }}
            onPress={handleLogin}
          >
            Login
          </Button>
        </Dialog.Actions>
      </Dialog>
    </View>
  );
};

export default Barcode;
