import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Button } from 'react-native-paper';


const LogInScreen = () => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    firstName: '',
    password: '',
  });
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };


  const handleLogin = async () => {
    try {
      const response = await fetch(__DEV__ ? 'http://192.168.50.201:3000/api/login' : 'https://joraapp.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        Alert.alert('Gabim', data.message || 'Kredencialet janë të pasakta');
      } else {
        await AsyncStorage.setItem('loggedInUser', JSON.stringify(data.user));


        Alert.alert('Sukses', 'Jeni identifikuar me sukses');
        router.replace('/(tabs)/home');
      }
    } catch (error) {
      Alert.alert('Gabim', 'Nuk u lidh me serverin');
      console.error('Login error:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.custom}>
        <TextInput
          style={styles.input}
          placeholder={t('name')}
          placeholderTextColor="#1F1F1F"
          value={formData.firstName}
          onChangeText={(text) => handleInputChange('firstName', text)}
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
      </View>

      <View style={styles.bottomSection}>
        <Button
          mode="contained"
          onPress={handleLogin}
          style={styles.registerButton}
          labelStyle={styles.buttonText}
        >
          {t('logIn')}
        </Button>
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
    flex: 1,
    height: '100%',
  },
  custom: {
    gap: 20,
  },
  input: {
    backgroundColor: '#FFFFFF',
    height: 60,
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 18,
    color: '#1F1F1F',
  },
  passwordContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    alignItems: 'center',
    height: 60,
    paddingHorizontal: 20,
    paddingVertical: 10,
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
    width: 180,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '500',
  },
  bottomSection: {
    alignItems: 'center',
  },
});

export default LogInScreen;
