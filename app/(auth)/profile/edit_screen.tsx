import { globalStyles } from '@/assets/globalStyles';
import { ENDPOINTS, getApiUrl } from '@/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Button, Dialog, Provider as PaperProvider, Portal } from 'react-native-paper';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 45,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(250, 250, 250, 1)',
    gap: 24.5,
  },
  cityText: {
    fontSize: 16,
    color: '#1F1F1F',
  },
  title: {
    textAlign: 'center',
  },

});

const handleDeleteUser = async () => {
  try {
    const userData = await AsyncStorage.getItem('loggedInUser');
    if (!userData) {
      Alert.alert('Gabim', 'Nuk u gjet përdoruesi.');
      return;
    }

    const parsed = JSON.parse(userData);
    const userId = parsed._id;

    const response = await fetch(getApiUrl(`/api/user/${userId}`), { method: 'DELETE',
});


    const result = await response.json();

    if (response.ok) {
      await AsyncStorage.multiRemove(['loggedInUser', 'selectedCity']); // 🔥 fshij edhe selectedCity
      Alert.alert('Sukses', 'Llogaria u fshi me sukses');
      router.replace('/');
    } else {
      Alert.alert('Gabim', result.message || 'Fshirja dështoi.');
    }
  } catch (error) {
    console.error('❌ Gabim gjatë fshirjes së llogarisë:', error);
    Alert.alert('Gabim', 'Ndodhi një gabim gjatë fshirjes.');
  }
};


const EditScreen = () => {
    const { t } = useTranslation();
    const { selectedCity } = useLocalSearchParams();

  const router = useRouter();

  const [postalCode, setPostalCode] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState<string | undefined>(selectedCity?.toString());
  const [firstName, setFirstName] = useState('');

  const [modalVisible, setModalVisible] = useState(false);

  const loadUserData = useCallback(async () => {
    try {
      const localUser = await AsyncStorage.getItem('loggedInUser');
      if (!localUser) return;

      const parsed = JSON.parse(localUser);
      const userFirstName = parsed.firstName;
      setFirstName(userFirstName);
      const response = await fetch(getApiUrl(ENDPOINTS.USER(userFirstName)));
      const data = await response.json();
      if (response.ok) {
        const user = data.user;
        setAddress(user.address || '');
        setPostalCode(user.postalCode || '');
        setCity(user.city || '');
        await AsyncStorage.setItem('loggedInUser', JSON.stringify(user));
      } else {
        console.warn('❌ Failed to fetch updated user:', data.message);
      }
    } catch (err) {
      console.error('❌ Error fetching user:', err);
    }
  }, []);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const autoSave = useCallback(async (updatedFields: Partial<{ address: string; postalCode: string; city: string }>) => {
    try {
      if (!firstName) return;

      const res = await fetch(
        getApiUrl(ENDPOINTS.USER_ADDRESS),
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstName, ...updatedFields }),
        }
      );


      const data = await res.json();

      if (res.ok) {
        await AsyncStorage.setItem('loggedInUser', JSON.stringify(data.user));
        console.log('✅ Autosaved:', updatedFields);
      } else {
        console.warn('❌ Autosave failed:', data.message);
      }
    } catch (error) {
      console.error('❌ Autosave error:', error);
    }
  }, [firstName]);

  useFocusEffect(
    useCallback(() => {
      const fetchCityFromStorage = async () => {
        const storedCity = await AsyncStorage.getItem('selectedCity');
        if (storedCity) {
          setCity(storedCity);
          autoSave({ city: storedCity });
        }
      };
      fetchCityFromStorage();
    }, [autoSave])
  );


  return (
    <PaperProvider>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={globalStyles.globalContainer}>
        <TouchableOpacity
            style={globalStyles.input}
            onPress={() =>
              router.push({ pathname: '/(auth)/profile/cities', params: { from: 'edit' } })
            }
          >
            <Text style={styles.cityText}>
              {city ? `${t('edit.city')}: ${city}` : t('edit.selectCity')}
            </Text>
          </TouchableOpacity>

          <TextInput
            style={globalStyles.input}
            placeholder={t('edit.post')}
            placeholderTextColor="#1F1F1F"
            value={postalCode}
            onChangeText={(text) => setPostalCode(text)}
            onBlur={() => autoSave({ postalCode })}
          />

          <TextInput
            style={globalStyles.input}
            placeholder={t('edit.address')}
            placeholderTextColor="#1F1F1F"
            value={address}
            onChangeText={(text) => setAddress(text)}
            onBlur={() => autoSave({ address })}
          />

          {/* Button that opens the modal */}
          <TouchableOpacity
            style={globalStyles.input}
            onPress={() => setModalVisible(true)}
          >
            <Text style={{ color: 'red', fontSize: 16 }}>{t('delete')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Portal>
        <Dialog  style={globalStyles.modal} visible={modalVisible} onDismiss={() => setModalVisible(false)}>
          <Dialog.Icon icon="alert" />
          <Dialog.Title style={globalStyles.dialogTitle}>{t('modalDelete')}</Dialog.Title>
          <Dialog.Content>
            <Text style={globalStyles.dialogText}>{t('titleModal')}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setModalVisible(false)} style={globalStyles.dialogButton}>{t('no')}</Button>
            <Button style={globalStyles.buttonDialog}
              textColor="#fff"
              onPress={() => {
                setModalVisible(false);
                handleDeleteUser();
              }}
            >
              {t('yes')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </PaperProvider>
  );
};

export default EditScreen;
