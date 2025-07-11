import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ENDPOINTS, getApiUrl } from '../config/api';

const RegisterScreen = () => {
  const { t } = useTranslation();
  const { selectedCity } = useLocalSearchParams<{ selectedCity?: string }>();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    city: selectedCity || '',
    number: '',
    expoPushToken: '',
  });
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const loadSelectedCity = async () => {
        try {
          const city = await AsyncStorage.getItem('selectedCity');
          if (city) {
            setFormData((prev) => ({ ...prev, city }));
            await AsyncStorage.removeItem('selectedCity');
          }
        } catch (error) {
          console.error('Error loading city:', error);
        }
      };
      loadSelectedCity();
    }, [])
  );

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateInputs = () => {
    const { firstName, lastName, password, confirmPassword, city, number } = formData;
    if (!firstName || !lastName || !password || !confirmPassword || !city || !number) {
      return 'Të gjitha fushat janë të detyrueshme';
    }
    if (password !== confirmPassword) {
      return 'Fjalëkalimet nuk përputhen';
    }
    // Password: min 6 karaktere (testim)
    if (password.length < 6) {
      return 'Fjalëkalimi duhet të ketë të paktën 6 karaktere.';
    }
    // Numri i telefonit: vetëm shifra, min 8 karaktere
    if (!/^\d{8,}$/.test(number)) {
      return 'Numri i telefonit duhet të ketë të paktën 8 shifra.';
    }
    return null;
  };

  const handleRegister = async () => {
    const error = validateInputs();
    if (error) {
      Alert.alert('Gabim', error);
      return;
    }
    setLoading(true);
    try {
      const token = await getExpoPushToken();
      const updatedFormData = { ...formData, expoPushToken: token };
      const response = await fetch(getApiUrl(ENDPOINTS.REGISTER), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFormData),
      });
      const data = await response.json();
      if (!response.ok) {
        Alert.alert('Gabim', data.message || 'Dicka shkoi keq');
      } else {
        Alert.alert('Sukses', 'Regjistrimi u krye me sukses!');
        if (data.user) {
          await AsyncStorage.setItem('loggedInUser', JSON.stringify(data.user));
        }
        setFormData({
          firstName: '',
          lastName: '',
          password: '',
          confirmPassword: '',
          city: '',
          number: '',
          expoPushToken: '',
        });
        await AsyncStorage.multiRemove(['selectedCity', 'registerFormData']);
        router.replace('/logIn');
      }
    } catch (error) {
      Alert.alert('Gabim', 'Nuk u lidh me serverin');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getExpoPushToken = async () => {
    if (Platform.OS === 'web') {
      return 'web-token-placeholder';
    }
    if (!Device.isDevice) {
      return 'device-token-placeholder';
    }
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      return 'no-permission-token-placeholder';
    }
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: '10d2bf05-f514-495b-bad9-5580e3dd0c87',
      });
      return tokenData.data;
    } catch (error) {
      return 'error-token-placeholder';
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View>
        <TextInput
          style={styles.input}
          placeholder={t('name')}
          placeholderTextColor="#1F1F1F"
          value={formData.firstName}
          onChangeText={(text) => handleInputChange('firstName', text)}
        />
        <TextInput
          style={styles.input}
          placeholder={t('surname')}
          placeholderTextColor="#1F1F1F"
          value={formData.lastName}
          onChangeText={(text) => handleInputChange('lastName', text)}
        />
        <View style={styles.passwordContainer}>
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
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder={t('password.confirm')}
            secureTextEntry={!confirmPasswordVisible}
            placeholderTextColor="#1F1F1F"
            value={formData.confirmPassword}
            onChangeText={(text) => handleInputChange('confirmPassword', text)}
          />
          <TouchableOpacity onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}>
            <Image
              source={require('../../assets/images/eyeIcon.png')}
              style={styles.eyeIcon}
            />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.inputCity}
          onPress={() =>
            router.push({ pathname: '/(auth)/profile/cities', params: { from: 'register' } })
          }
        >
          <Text style={styles.cityInput}>{formData.city || t('edit.selectCity')}</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Phone Number"
          placeholderTextColor="#1F1F1F"
          value={formData.number}
          onChangeText={(text) => handleInputChange('number', text)}
          keyboardType="phone-pad"
        />
      </View>
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={[styles.registerButton, loading && { backgroundColor: '#ccc' }]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{t('register')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 100,
    backgroundColor: '#FAFAFA',
    justifyContent: 'space-between',
  },
  input: {
    backgroundColor: '#F4F4F4',
    padding: 12,
    marginVertical: 8,
    borderRadius: 6,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F4',
    borderRadius: 6,
    marginVertical: 8,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
  },
  eyeIcon: {
    width: 24,
    height: 24,
    marginHorizontal: 8,
  },
  inputCity: {
    backgroundColor: '#F4F4F4',
    padding: 12,
    marginVertical: 8,
    borderRadius: 6,
  },
  cityInput: {
    color: '#1F1F1F',
  },
  bottomSection: {
    marginTop: 30,
  },
  registerButton: {
    backgroundColor: '#EB2328',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default RegisterScreen;
