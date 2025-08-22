import { useUserStore } from '@/app/store/useUserStore';
import { globalStyles } from '@/assets/globalStyles';
import { ENDPOINTS, getApiUrl } from '@/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Left from '../../../assets/images/left-side.svg';
import ProfileIcon from '../../../assets/images/profile.svg';
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 30,
    paddingHorizontal: 15,
    backgroundColor: '#FAFAFA',
    gap: 24.5,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    marginRight: 20,
  },
  titleContainer: {
    flex: 1,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F1F1F',
    textAlign: 'center',
    marginRight: 30,
  },
  profilePicContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  globalContainer: {
    borderWidth: 0.5,
    borderColor: '#EB2328',
    padding: 10,
    borderRadius: 5,
    gap: 15,
  },
  profilePic: {
    width: 140,
    height: 140,
    borderRadius: '100%',
  },
  profile:{
    position: 'absolute',  
    bottom: -10  ,
    right: 110,
  },
  buttonSection: {
    display: 'flex',
    flexDirection: 'row',
    gap: 15,
    width: '100%',
    paddingBottom: 62,
  },
  button: {
    backgroundColor: '#EB2328',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    height: 40,
  },
  buttonCancel: {
    backgroundColor: '#FFF1F2',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    height: 40,
  },
  buttonCancelText: {
    color: '#EB2328',
    fontSize: 16,
    fontWeight: '400',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '400',
  },
  textInput: {
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    color: '#1F1F1F',
  },
  cityText: {
    fontSize: 16,
    color: '#1F1F1F',
  },
});

const EditScreen = () => {
  const { t } = useTranslation();
  const { selectedCity } = useLocalSearchParams();
  const { user, setUser } = useUserStore();
  const router = useRouter();
  const showDialog = () => setVisible(true);
  const [visible, setVisible] = React.useState(false);

  const [address, setAddress] = useState('');
  const [city, setCity] = useState<string | undefined>(selectedCity?.toString());
  const [firstName, setFirstName] = useState('');

  // Create refs for the inputs
  const inputRef1 = React.useRef<TextInput>(null) as React.RefObject<TextInput>;
  const inputRef2 = React.useRef<TextInput>(null) as React.RefObject<TextInput>;
  const inputRef3 = React.useRef<TextInput>(null) as React.RefObject<TextInput>;
  const inputRef4 = React.useRef<TextInput>(null) as React.RefObject<TextInput>;
  const inputRef5 = React.useRef<TextInput>(null) as React.RefObject<TextInput>;

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

  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        alert('Leja për galerinë është e nevojshme!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
        base64: true,
      });

      if (!result.canceled && result.assets?.length > 0 && user?.firstName) {
        const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;

        const res = await fetch(getApiUrl(ENDPOINTS.USER_PHOTO), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ firstName: user.firstName, photo: base64Img }),
        });

        const data = await res.json();

        if (res.ok) {
          setUser(data.user);
          Alert.alert('Sukses', 'Foto u përditësua me sukses!');
        } else {
          Alert.alert('Gabim', data.message);
        }
      }
    } catch (error) {
      console.error('❌ Error picking image:', error);
    }
  };

  // Handle the return button for each TextInput
  const handleSubmitEditing = (nextInputRef: React.RefObject<TextInput>) => {
    if (nextInputRef.current) {
      nextInputRef.current.focus();
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <View style={styles.topSection}>
            <TouchableOpacity style={styles.iconContainer}>
              <Left fill={'#EB2328'} width={24} height={24} />
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.headerText}>Ndrysho profilin</Text>
            </View>
          </View>

          <View style={styles.profilePicContainer}>
            <TouchableOpacity onPress={pickImage}>
              <Image
                source={user && user.photo ? { uri: user.photo } : require('../../../assets/images/unknown-profile.jpg')}
                style={styles.profilePic}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <ProfileIcon style={styles.profile} width={42} height={42}/>
          </View>

          <View style={styles.globalContainer}>
            <TextInput
              style={globalStyles.input}
              placeholder='Emri dhe mbiemri'
              placeholderTextColor="#1F1F1F"
              returnKeyType="next"
              onSubmitEditing={() => handleSubmitEditing(inputRef2)}
            />
            <TextInput
              style={globalStyles.input}
              placeholder='E-mail'
              placeholderTextColor="#1F1F1F"
              returnKeyType="next"
              ref={inputRef2}
              onSubmitEditing={() => handleSubmitEditing(inputRef3)}
            />
            <TextInput
              style={globalStyles.input}
              placeholder='Numri i telefonit'
              placeholderTextColor="#1F1F1F"
              returnKeyType="next"
              ref={inputRef3}
              onSubmitEditing={() => handleSubmitEditing(inputRef4)}
            />
            <TouchableOpacity
              style={globalStyles.input}
              onPress={() => router.push({ pathname: '/(auth)/profile/cities', params: { from: 'edit' } })}
            >
              <Text style={styles.cityText}>{city ? `${t('edit.city')}: ${city}` : t('edit.selectCity')}</Text>
            </TouchableOpacity>
            <TextInput
              style={globalStyles.input}
              placeholder={t('edit.address')}
              placeholderTextColor="#1F1F1F"
              value={address}
              onChangeText={(text) => setAddress(text)}
              onBlur={() => autoSave({ address })}
              returnKeyType="done"
              ref={inputRef4}
            />
          </View>

          <View style={styles.buttonSection}>
            <TouchableOpacity style={styles.buttonCancel}>
              <Text style={styles.buttonCancelText}>Anulo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={showDialog}>
              <Text style={styles.buttonText}>Ruaj</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditScreen;
