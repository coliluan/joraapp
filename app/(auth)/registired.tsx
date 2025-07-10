import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import PhoneInput from 'react-native-phone-number-input';

const RegisterScreen = () => {
  const { t } = useTranslation();
  const { selectedCity } = useLocalSearchParams<{ selectedCity?: string }>();
  const phoneInput = useRef<PhoneInput>(null);
  const [value, setValue] = useState('');
  const [valid, setValid] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    city: selectedCity || '',
    number: '',
    expoPushToken: '',
  });

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

  const handleRegister = async () => {
    const { firstName, lastName, password, confirmPassword, city, number } = formData;
  
    if (!firstName || !lastName || !password || !confirmPassword || !city || !number) {
      Alert.alert('Gabim', 'Të gjitha fushat janë të detyrueshme');
      return;
    }
  
    if (password !== confirmPassword) {
      Alert.alert('Gabim', 'Fjalëkalimet nuk përputhen');
      return;
    }
  
    try {
      const token = await getExpoPushToken();
      if (!token) {
        Alert.alert('Gabim', 'Nuk u gjenerua token-i për push notifications');
        return;
      }
  
      const updatedFormData = { ...formData, expoPushToken: token };
  
      const response = await fetch('https://joracenterapp-3.onrender.com/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFormData),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        Alert.alert('Gabim', data.message || 'Dicka shkoi keq');
      } else {
        Alert.alert('Sukses', data.message);
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
    }
  };
  

  const getExpoPushToken = async () => {
    if (!Device.isDevice) {
      Alert.alert('Duhet pajisje fizike për push notifications');
      return;
    }
  
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
  
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
  
    if (finalStatus !== 'granted') {
      Alert.alert('Nuk ke leje për push notifications');
      return;
    }
  
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });

    return tokenData.data;
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

        <PhoneInput
          ref={phoneInput}
          defaultValue={value}
          defaultCode="XK"
          layout="first"
          onChangeText={setValue}
          onChangeFormattedText={(formattedText) => {
            const checkValid = phoneInput.current?.isValidNumber(formattedText);
            setValid(checkValid ?? false);

            if (checkValid) {
              const fullNumber =
                phoneInput.current?.getNumberAfterPossiblyEliminatingZero()?.formattedNumber ?? '';
              handleInputChange('number', fullNumber);
            } else {
              handleInputChange('number', '');
            }
          }}
          containerStyle={styles.phoneContainer}
          textContainerStyle={styles.phoneTextContainer}
          textInputStyle={styles.phoneTextInput}
          flagButtonStyle={styles.flagButtonStyle}
          codeTextStyle={styles.codeTextStyle}
          placeholder="Enter your phone number"
        />

        <Text>Valid : {valid ? 'true' : 'false'}</Text>
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.buttonText}>{t('register')}</Text>
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
    flexGrow: 1,
    gap: 20,
    height: 850,
  },
  input: {
    backgroundColor: '#FFF',
    height: 60,
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 18,
    color: '#1F1F1F',
    marginBottom: 10,
  },
  inputCity: {
    height: 60,
    marginBottom: 10,
    padding: 19,
    backgroundColor: '#FFF',
  },
  cityInput: {
    fontSize: 18,
  },
  phoneContainer: {
    backgroundColor: '#FFF',
    height: 60,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
  },
  phoneTextContainer: {
    backgroundColor: '#FFF',
    borderRadius: 5,
    paddingVertical: 10,
    paddingLeft: 10,
  },
  phoneTextInput: {
    fontSize: 18,
    color: '#1F1F1F',
  },
  flagButtonStyle: {
    width: 40,
    justifyContent: 'flex-start',
    paddingLeft: 24,
  },
  codeTextStyle: {
    fontSize: 18,
    color: '#1F1F1F',
    marginRight: 10,
  },
  passwordContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 5,
    alignItems: 'center',
    height: 60,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 10,
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
  registerButton: {
    backgroundColor: '#EB2328',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    width: 180,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '500',
  },
  bottomSection: {
    alignItems: 'center',
    marginTop: 30,
  },
});

export default RegisterScreen;
