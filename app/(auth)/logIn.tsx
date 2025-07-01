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
      const response = await fetch('http://192.168.50.173:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        Alert.alert('Gabim', data.message || 'Kredencialet janë të pasakta');
      } else {
        // Save user data including barcode in AsyncStorage
        await AsyncStorage.setItem('loggedInUser', JSON.stringify(data.user));
  
        Alert.alert('Sukses', 'Jeni identifikuar me sukses');
        router.push('/(tabs)/home'); // Redirect to home or wherever you need
      }
    } catch (error) {
      Alert.alert('Gabim', 'Nuk u lidh me serverin');
      console.error('Login error:', error);
    }
  };
  

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style= {styles.custom}>
      <TextInput 
      style={styles.input} 
      placeholder={t('name')}
      placeholderTextColor="#rgba(31, 31, 31, 1)" 
      value={formData.firstName}
      onChangeText={(text) => handleInputChange('firstName', text)}
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder={t('placeHolder')}
          secureTextEntry={!passwordVisible}
          placeholderTextColor="#rgba(31, 31, 31, 1)"
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
    gap:20,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 1)',
    height: 60,
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 18,
    color: '#rgba(31, 31, 31, 1)',
  },
  passwordContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
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
    backgroundColor: '#rgba(235, 35, 40, 1)',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0,
    width: 180,
  },
  buttonText: {
    color: '#rgba(255, 255, 255, 1)',
    fontSize: 20,
    fontFamily: 'Poppins',
    fontWeight: '500',
  },
  bottomSection: {
    alignItems: 'center',
  }
});

export default LogInScreen;
