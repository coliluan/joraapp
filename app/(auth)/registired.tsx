import { globalStyles } from '@/assets/globalStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  // ActivityIndicator,  //ask for usage 
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
import PhoneInput from 'react-native-phone-number-input';
import { ENDPOINTS, getApiUrl } from '../config/api';


const RegisterScreen = () => {
  const { t } = useTranslation();
  const { selectedCity } = useLocalSearchParams<{ selectedCity?: string }>();
  const phoneInput = useRef<PhoneInput>(null);
  const [value, setValue] = useState('');
  // const [valid, setValid] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
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
    const { firstName, lastName, email, password, confirmPassword, city, number } = formData;
    if (!firstName || !lastName || !email || !password || !confirmPassword || !city || !number) {
      return 'Të gjitha fushat janë të detyrueshme';
    }
    if (password !== confirmPassword) {
      return 'Fjalëkalimet nuk përputhen';
    }
    // Password: min 6 karaktere (testim)
    if (password.length < 6) {
      return 'Fjalëkalimi duhet të ketë të paktën 6 karaktere.';
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
          email: '',
          password: '',
          confirmPassword: '',
          city: '',
          number: '',
          expoPushToken: '',
        });
        await AsyncStorage.multiRemove(['selectedCity', 'registerFormData']);
        router.replace('/(tabs)/home');
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
    } catch {
      return 'error-token-placeholder';
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={globalStyles.globalContainer}>
        <TextInput
          style={globalStyles.input}
          placeholder={t('name')}
          placeholderTextColor="#1F1F1F"
          value={formData.firstName}
          onChangeText={(text) => handleInputChange('firstName', text)}
        />
        <TextInput
          style={globalStyles.input}
          placeholder={t('surname')}
          placeholderTextColor="#1F1F1F"
          value={formData.lastName}
          onChangeText={(text) => handleInputChange('lastName', text)}
        />
        <TextInput
          style={globalStyles.input}
          placeholder="E - Mail"
          placeholderTextColor="#1F1F1F"
          keyboardType="email-address"
          autoCapitalize="none"
          value={formData.email}
          onChangeText={(text) => handleInputChange('email', text)}
        />
        <PhoneInput
          ref={phoneInput}
          defaultValue={value}
          defaultCode="XK"
          layout="first"
          onChangeText={setValue}
         onChangeFormattedText={(formattedText) => {
          const checkValid = phoneInput.current?.isValidNumber(formattedText);
          // setValid(checkValid ?? false);
          setValue(formattedText); 
                  
          if (checkValid) {
            handleInputChange('number', formattedText); // <-- kjo është e saktë
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
        <View style={globalStyles.passwordContainer}>
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
        <View style={globalStyles.passwordContainer}>
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
          style={globalStyles.input}
          onPress={() =>
            router.push({ pathname: '/(auth)/profile/cities', params: { from: 'register' } })
          }
        >
          <Text style={styles.cityInput}>{formData.city || t('edit.selectCity')}</Text>
        </TouchableOpacity>

        {/* <Text>Valid : {valid ? 'true' : 'false'}</Text> */}
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity style={globalStyles.registerButton} onPress={handleRegister}>
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
  cityInput: {
    fontSize: 18,
  },
  phoneContainer: {
    backgroundColor: '#FFF',
    height: 60,
    borderRadius: 5,
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
