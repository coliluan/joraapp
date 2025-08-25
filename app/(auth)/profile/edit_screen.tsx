import { useUserStore } from '@/app/store/useUserStore';
import { globalStyles } from '@/assets/globalStyles';
import { ENDPOINTS, getApiUrl } from '@/config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
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
  const { user, setUser } = useUserStore();
  const router = useRouter();

  const [address, setAddress] = useState('');
  const [city, setCity] = useState<string | undefined>('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  // For restoring old values on cancel
  const [initialValues, setInitialValues] = useState({ address: '', city: '', email: '', phone: '', firstName: '', lastName: '' });

  // Input refs for keyboard navigation
  const lastNameRef = React.useRef<TextInput>(null);
  const emailRef = React.useRef<TextInput>(null);
  const phoneRef = React.useRef<TextInput>(null);
  const addressRef = React.useRef<TextInput>(null);

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
        setEmail(user.email || '');
        setPhone(user.number || '');
        setFirstName(user.firstName || '');
        setLastName(user.lastName || '');
        setInitialValues({
          address: user.address || '',
          city: user.city || '',
          email: user.email || '',
          phone: user.number || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
        });
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

  // Listen for city selection change (from cities.tsx) on navigation focus
  useFocusEffect(
    React.useCallback(() => {
      let isActive = true;
      const checkCity = async () => {
        const selected = await AsyncStorage.getItem('selectedCity');
        if (selected && isActive) {
          setCity(selected);
          await AsyncStorage.removeItem('selectedCity');
        }
      };
      checkCity();
      return () => {
        isActive = false;
      };
    }, [])
  );

    const [image, setImage] = useState<string | undefined>(undefined);
    const [imageBase64, setImageBase64] = useState<string | undefined>(undefined);
    const [changedFields, setChangedFields] = useState<any>({});

    const pickImage = async () => {
      try {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
          alert('Leja për galerinë është e nevojshme!');
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 4],
          quality: 1,
          base64: true,
        });
        if (!result.canceled && result.assets?.length > 0) {
          setImage(result.assets[0].uri);
          setImageBase64(result.assets[0].base64 ?? undefined);
          setChangedFields((prev: any) => ({ ...prev, photo: result.assets[0].base64 }));
          // Always use user.email from state, not editable field
          const userEmail = user && user.email ? user.email : null;
          if (!userEmail) {
            Alert.alert("Gabim", "Nuk u gjet email-i i përdoruesit. Ju lutem rifreskoni aplikacionin ose ri-logohuni.");
            return;
          }
          // Upload image to backend
          try {
            const response = await fetch(getApiUrl(ENDPOINTS.USER_PHOTO), {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email: userEmail, photo: result.assets[0].base64 })
            });
            let data;
            try {
              data = await response.json();
            } catch {
              // If response is not JSON (e.g., HTML error page), log and alert
              const text = await response.text();
              console.error("Non-JSON response from image upload:", text);
              Alert.alert("Gabim", "Serveri ktheu një përgjigje të papritur. Kontrolloni lidhjen ose kontaktoni suportin.");
              return;
            }
            if (response.ok) {
              setUser(data.user);
              setImage(undefined); // always use user.photo from state after upload
              await AsyncStorage.setItem('loggedInUser', JSON.stringify(data.user));
              Alert.alert("Sukses", "Fotoja u ndryshua me sukses");
            } else {
              Alert.alert("Gabim", data.message || "Nuk u ndryshua fotoja");
            }
          } catch (error) {
            Alert.alert("Gabim", "Error uploading image: " + error);
          }
        }
      } catch (err) {
        Alert.alert('Gabim', 'Nuk u përzgjodh dot fotoja.');
      }
    };
  // Removed unused handleSubmitEditing function

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
                source={
                  user && user.photo
                    ? { uri: user.photo.startsWith('data:image') ? user.photo : `data:image/jpeg;base64,${user.photo}` }
                    : image
                    ? { uri: image }
                    : require('../../../assets/images/unknown-profile.jpg')
                }
                style={styles.profilePic}
                resizeMode="cover"
              />
            </TouchableOpacity>
            <ProfileIcon style={styles.profile} width={42} height={42}/>
          </View>


          <View style={styles.globalContainer}>
            <TextInput
              style={globalStyles.input}
              placeholder='Emri'
              placeholderTextColor="#1F1F1F"
              value={firstName}
              onChangeText={setFirstName}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => lastNameRef.current?.focus()}
            />
            <TextInput
              ref={lastNameRef}
              style={globalStyles.input}
              placeholder='Mbiemri'
              placeholderTextColor="#1F1F1F"
              value={lastName}
              onChangeText={setLastName}
              returnKeyType="next"
              blurOnSubmit={false}
              onSubmitEditing={() => emailRef.current?.focus()}
            />
            <TextInput
              ref={emailRef}
              style={globalStyles.input}
              placeholder='E-mail'
              placeholderTextColor="#1F1F1F"
              value={email}
              onChangeText={setEmail}
              returnKeyType="next"
              blurOnSubmit={false}
              keyboardType="email-address"
              autoCapitalize="none"
              onSubmitEditing={() => phoneRef.current?.focus()}
            />
            <TextInput
              ref={phoneRef}
              style={globalStyles.input}
              placeholder='Numri i telefonit'
              placeholderTextColor="#1F1F1F"
              value={phone}
              onChangeText={setPhone}
              returnKeyType="next"
              blurOnSubmit={false}
              keyboardType="phone-pad"
              onSubmitEditing={() => addressRef.current?.focus()}
            />
            <TouchableOpacity
              style={globalStyles.input}
              onPress={() => router.push({ pathname: '/(auth)/profile/cities', params: { from: 'edit' } })}
            >
              <Text style={styles.cityText}>{city ? `${t('edit.city')}: ${city}` : t('edit.selectCity')}</Text>
            </TouchableOpacity>
            <TextInput
              ref={addressRef}
              style={globalStyles.input}
              placeholder={t('edit.address')}
              placeholderTextColor="#1F1F1F"
              value={address}
              onChangeText={(text) => setAddress(text)}
              returnKeyType="done"
              onSubmitEditing={() => {
                // Optionally dismiss keyboard or submit form
              }}
            />
          </View>

          <View style={styles.buttonSection}>
            <TouchableOpacity style={styles.buttonCancel} onPress={() => {
              setAddress(initialValues.address);
              setCity(initialValues.city);
              setEmail(initialValues.email);
              setPhone(initialValues.phone);
              setFirstName(initialValues.firstName);
              setLastName(initialValues.lastName);
              Alert.alert('Ndryshimet u anuluan');
            }}>
              <Text style={styles.buttonCancelText}>Anulo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={async () => {
                try {
                  if (!firstName) return;
                  // Only send changed fields
                  const updatedFields: any = { firstName };
                  if (lastName !== initialValues.lastName) updatedFields.lastName = lastName;
                  if (address !== initialValues.address) updatedFields.address = address;
                  if (city !== initialValues.city) updatedFields.city = city;
                  if (email !== initialValues.email) updatedFields.email = email;
                  if (phone !== initialValues.phone) updatedFields.number = phone;

                  const res = await fetch(getApiUrl(ENDPOINTS.USER_ADDRESS), {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedFields),
                  });
                  const data = await res.json();
                  if (res.ok) {
                    setUser(data.user);
                    setInitialValues({
                      address: data.user.address || '',
                      city: data.user.city || '',
                      email: data.user.email || '',
                      phone: data.user.number || '',
                      firstName: data.user.firstName || '',
                      lastName: data.user.lastName || '',
                    });
                    setAddress(data.user.address || '');
                    setCity(data.user.city || '');
                    setEmail(data.user.email || '');
                    setPhone(data.user.number || '');
                    setFirstName(data.user.firstName || '');
                    setLastName(data.user.lastName || '');
                    await AsyncStorage.setItem('loggedInUser', JSON.stringify(data.user));
                    Alert.alert('Sukses', 'Të dhënat u ruajtën me sukses!');
                  } else {
                    Alert.alert('Gabim', data.message || 'Nuk u ruajtën të dhënat.');
                  }
                } catch (error) {
                  Alert.alert('Gabim', 'Ndodhi një gabim gjatë ruajtjes.');
                }
              }}
            >
              <Text style={styles.buttonText}>Ruaj</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditScreen;
