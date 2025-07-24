// app/components/LoginModal.tsx
import { globalStyles } from '@/assets/globalStyles';
import { router } from 'expo-router';
import { t } from 'i18next';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Button, Dialog } from 'react-native-paper';
import { ENDPOINTS, getApiUrl } from '../../config/api';
import { useUserStore } from '../store/useUserStore';

const LoginModal = () => {
  const [formData, setFormData] = useState({ firstName: '', password: '' });
    const [passwordVisible, setPasswordVisible] = useState(false);
  
  const { setUser } = useUserStore();

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
        return;
      }

      setUser(data.user);
      Alert.alert('Sukses', 'Jeni identifikuar me sukses');
    } catch (err) {
      Alert.alert('Gabim', 'Nuk u lidh me serverin');
    }
  };

  return (
    // <Dialog visible={true} dismissable={false} style={globalStyles.modal}>
    //   <Dialog.Title>Ju lutem identifikohuni</Dialog.Title>
    //   <Dialog.Content>
    //     <TextInput
    //       placeholder="Emri"
    //       value={formData.firstName}
    //       onChangeText={(text) => setFormData({ ...formData, firstName: text })}
    //       style={styles.input}
    //     />
    //     <View style={styles.input}>
    //       <TextInput
    //         placeholder="Fjalëkalimi"
    //         value={formData.password}
    //         secureTextEntry={!visiblePassword}
    //         onChangeText={(text) => setFormData({ ...formData, password: text })}
    //         style={styles.passwordInput}
    //       />
    //       <TouchableOpacity onPress={() => setVisiblePassword(!visiblePassword)}>
    //         <Image source={require('../../assets/images/eyeIcon.png')} style={styles.eyeIcon} />
    //       </TouchableOpacity>
    //     </View>
    //   </Dialog.Content>
    //   <Dialog.Actions>
    //     <Button onPress={handleLogin}>Login</Button>
    //   </Dialog.Actions>
    // </Dialog>
    <Dialog
            style={globalStyles.modal}
            visible={true}
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
                  onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                />
                <View style={styles.input}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder={t('placeHolder')}
                    secureTextEntry={!passwordVisible}
                    placeholderTextColor="#1F1F1F"
                    value={formData.password}
                    onChangeText={(text) => setFormData({ ...formData, password: text })}
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
                labelStyle={{ color: '#EB2328' }}
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
  );
};

export default LoginModal;

const styles = StyleSheet.create({
  // modal: { padding: 20 },
  // input: {
  //   backgroundColor: '#fff',
  //   marginBottom: 15,
  //   paddingHorizontal: 15,
  //   borderRadius: 5,
  //   height: 40,
  // },
  
  // passwordInput: { flex: 1 },
  // eyeIcon: { width: 20, height: 20, tintColor: '#999' },
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
      paddingVertical: 0,
      fontSize: 18,
    },
});
