import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const RegisterScreen = () => {
  const { t } = useTranslation();
  const { selectedCity } = useLocalSearchParams(); 

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    city: selectedCity || '',
    number: '',
  });

  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  useEffect(() => {
    const loadFormData = async () => {
      try {
        const savedFormData = await AsyncStorage.getItem('registerFormData');
        const selectedCity = await AsyncStorage.getItem('selectedCity');

        if (savedFormData) {
          setFormData(JSON.parse(savedFormData));
        }

        if (selectedCity) {
          setFormData((prev) => ({ ...prev, city: selectedCity }));
        }
        await AsyncStorage.removeItem('selectedCity');
      } catch (error) {
        console.error('Error loading form data:', error);
      }
    };

    loadFormData();
  }, []);

  useEffect(() => {
    const saveFormData = async () => {
      try {
        await AsyncStorage.setItem('registerFormData', JSON.stringify(formData));
      } catch (error) {
        console.error('Error saving form data:', error);
      }
    };
    saveFormData();
  }, [formData]);

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };


  const handleRegister = async () => {
    if (!formData.firstName || !formData.lastName || !formData.password || !formData.confirmPassword || !formData.city || !formData.number) {
      Alert.alert('Gabim', 'Të gjitha fushat janë të detyrueshme');
      return;
    }
  
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Gabim', 'Fjalëkalimet nuk përputhen');
      return;
    }
  
    try {
      const response = await fetch('http://192.168.50.173:3000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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
        });
  
        await AsyncStorage.removeItem('selectedCity');
        await AsyncStorage.removeItem('registerFormData');
  
        router.push('/logIn');
      }
    } catch (error) {
      Alert.alert('Gabim', 'Nuk u lidh me serverin');
      console.error('Error:', error);
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
          
          onPress={() => router.push('/(auth)/profile/cities')}
        >
          <Text style={styles.input}>{formData.city || t('edit.selectCity')}</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder={t('phone')}
          placeholderTextColor="#1F1F1F"
          value={formData.number}
          onChangeText={(text) => handleInputChange('number', text)}
          keyboardType="phone-pad"
        />
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
    height: '100%',
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
