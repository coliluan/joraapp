import { ENDPOINTS, getApiUrl } from '@/config/api';
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
import Left from '../../../assets/images/left-side.svg';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    marginRight: 10,
  },
  titleContainer: {
    flex: 1,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F1F1F',
    textAlign: 'center',
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 10,
    backgroundColor: '#FAFAFA',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#1F1F1F',
  },
  eyeIcon: {
    width: 22,
    height: 22,
    tintColor: '#999',
  },
  buttonWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  cancelText: {
    color: '#EB2328',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#EB2328',
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  saveText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
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
      const response = await fetch(getApiUrl(ENDPOINTS.USER_PASSWORD), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: userName, oldPassword, newPassword }),
      });

      const result = await response.json();
      if (!response.ok) {
        return Alert.alert('Gabim', result.message || 'Ndodhi një gabim.');
      }

      setSnackbarVisible(true);
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
        <View style={styles.topSection}>
          <TouchableOpacity style={styles.iconContainer}>
            <Left fill={'#EB2328'} width={24} height={24} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Text style={styles.headerText}>Ndrysho fjalkalimin</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 20 }} keyboardShouldPersistTaps="handled">
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder={t('password.old')}
              secureTextEntry={!passwordVisible}
              placeholderTextColor="#1F1F1F"
              value={oldPassword}
              onChangeText={setOldPassword}
            />
            <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
              <Image source={require('../../../assets/images/eyeIcon.png')} style={styles.eyeIcon} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder={t('password.new')}
              secureTextEntry={!passwordVisible}
              placeholderTextColor="#1F1F1F"
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
              <Image source={require('../../../assets/images/eyeIcon.png')} style={styles.eyeIcon} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder={t('password.confirm')}
              secureTextEntry={!passwordVisible}
              placeholderTextColor="#1F1F1F"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
              <Image source={require('../../../assets/images/eyeIcon.png')} style={styles.eyeIcon} />
            </TouchableOpacity>
          </View>

          <View style={styles.buttonWrapper}>
            <TouchableOpacity style={styles.cancelButton}>
              <Text style={styles.cancelText}>{t('password.cancel')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleChangePassword}>
              <Text style={styles.saveText}>{t('password.button')}</Text>
            </TouchableOpacity>
          </View>
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
