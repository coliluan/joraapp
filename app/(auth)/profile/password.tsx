import { ENDPOINTS, getApiUrl } from '@/app/config/api';
import { globalStyles } from '@/assets/globalStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { PaperProvider, Snackbar } from 'react-native-paper';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 45,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(250, 250, 250, 1)',
    gap: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    backgroundColor: 'red',
    borderRadius: 5,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    fontSize: 18,
    color: '#000',
    height:50,
  },
  passwordConfirm: {
    fontSize: 18,
    display:'flex',
    color: '#fff',
    padding: 15
  },
  eyeIcon: {
    width: 20,
    height: 20,
    tintColor: '#999',
  },
});

const PassWordScreen = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem('loggedInUser');
      if (userData) {
        const parsed = JSON.parse(userData);
        setUserName(parsed.firstName);
      }
    };
    loadUser();
  }, []);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      return Alert.alert('Gabim', 'Ju lutem plotësoni të gjitha fushat.');
    }

    if (newPassword !== confirmPassword) {
      return Alert.alert('Gabim', 'Fjalëkalimet e reja nuk përputhen.');
    }

    try {
      const response = await fetch(getApiUrl(ENDPOINTS.USER_PASSWORD),
  {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName: userName, oldPassword, newPassword }),
  }
);

      const result = await response.json();
      if (!response.ok) {
        return Alert.alert('Gabim', result.message || 'Ndodhi një gabim.');
      }

      setSnackbarVisible(true); // show success message
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error changing password:', error);
    }
  };


  
  return (
    <PaperProvider>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={{ gap: 20 }} keyboardShouldPersistTaps="handled">
          <View style={globalStyles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder={t('placeHolder')}
              secureTextEntry={!passwordVisible}
              placeholderTextColor="#rgba(31, 31, 31, 1)"
              value={oldPassword}
              onChangeText={setOldPassword}
            />
            <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
              <Image
                source={require('../../../assets/images/eyeIcon.png')}
                style={styles.eyeIcon}
              />
            </TouchableOpacity>
          </View>

          <View style={globalStyles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder={t('password.old')}
              secureTextEntry={!passwordVisible}
              placeholderTextColor="#rgba(31, 31, 31, 1)"
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
              <Image
                source={require('../../../assets/images/eyeIcon.png')}
                style={styles.eyeIcon}
              />
            </TouchableOpacity>
          </View>

          <View style={globalStyles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder={t('password.confirm')}
              secureTextEntry={!passwordVisible}
              placeholderTextColor="#rgba(31, 31, 31, 1)"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
              <Image
                source={require('../../../assets/images/eyeIcon.png')}
                style={styles.eyeIcon}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.buttonContainer} onPress={handleChangePassword}>
            <Text style={styles.passwordConfirm}>{t('password.button')}</Text>
          </TouchableOpacity>
        </ScrollView>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          style={{ backgroundColor: 'green' }}
        >
          {t('password.snackBar')}
        </Snackbar>
      </View>
    </PaperProvider>
  );
};

export default PassWordScreen;