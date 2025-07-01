import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Button,
  Dialog,
  Provider as PaperProvider,
  Portal,
} from 'react-native-paper';

const ProfileScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [number, setNumber] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  useEffect(() => {
    const loadUserDetails = async () => {
      try {
        const userData = await AsyncStorage.getItem('loggedInUser');
        if (userData) {
          const parsed = JSON.parse(userData);
          setUserName(parsed.firstName);
          if (parsed.photo) setProfileImage(parsed.photo);

          const response = await fetch(
            `http://192.168.50.173:3000/api/user/${parsed.firstName}`
            // `http://localhost:3000/api/user/${parsed.firstName}`

          );
          const result = await response.json();

          if (response.ok && result.user) {
            setNumber(result.user.number);
            if (result.user.photo) setProfileImage(result.user.photo);
          } else {
            console.warn('User not found or missing number');
          }
        }
      } catch (error) {
        console.error('Error loading user details:', error);
      }
    };

    loadUserDetails();
  }, []);

  const pickImage = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
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

      if (!result.canceled && result.assets?.length > 0) {
        const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setProfileImage(base64Img);

        if (userName) {
          const res = await fetch(
            'http://192.168.50.173:3000/api/user/photo',
            // 'http://localhost:3000/api/user/photo',

            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                firstName: userName,
                photo: base64Img,
              }),
            }
          );

          const data = await res.json();
          if (res.ok) {
            console.log('✅ Foto u ruajt!');
            await AsyncStorage.setItem(
              'loggedInUser',
              JSON.stringify(data.user)
            );
            setProfileImage(data.user.photo);
          } else {
            Alert.alert('Gabim', data.message);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error picking image:', error);
    }
  };

  const handleDeleteUser = async () => {
    try {
      const userData = await AsyncStorage.getItem('loggedInUser');
      if (!userData) {
        Alert.alert('Gabim', 'Nuk u gjet përdoruesi.');
        return;
      }
      const parsed = JSON.parse(userData);
      const userId = parsed._id;
      const response = await fetch(
        `http://192.168.50.173:3000/api/user/${userId}`,
        // `http://localhost:3000/api/user/${userId}`,

        {
          method: 'DELETE',
        }
      );

      const result = await response.json();

      if (response.ok) {
        await AsyncStorage.removeItem('loggedInUser');
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

  const options = [
    {
      label: t('profile.profile'),
      icon: require('../../assets/images/edit.png'),
      screen: '../(auth)/profile/edit_screen',
    },
    {
      label: t('placeHolder'),
      icon: require('../../assets/images/password.png'),
      screen: '../(auth)/profile/password',
    },
    {
      label: t('profile.lang'),
      icon: require('../../assets/images/language.png'),
      screen: '../(auth)/profile/language',
    },
  ] as const;

  return (
    <PaperProvider>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.innerContent}>
            <View style={styles.notification}>
              <TouchableOpacity>
                <Image source={require('../../assets/images/notification.png')} />
              </TouchableOpacity>
            </View>

            <View style={styles.header}>
              <TouchableOpacity onPress={pickImage}>
                <Image
                  source={
                    profileImage
                      ? { uri: profileImage }
                      : require('../../assets/images/unknown-profile.jpg')
                  }
                  style={styles.avatar}
                />
              </TouchableOpacity>

              <View style={styles.userInfo}>
                <Text style={styles.name}>{userName}</Text>
                <Text style={styles.phone}>{number}</Text>
              </View>
            </View>

            <View style={styles.profileSection}>
              {options.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.option}
                  onPress={() => router.push(item.screen)}
                >
                  <View style={styles.image}>
                    <Image source={item.icon} style={styles.icon} />
                  </View>
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.option} onPress={showDialog}>
                <View style={styles.image}>
                  <Image
                    source={require('../../assets/images/trash.png')}
                    style={styles.icon}
                  />
                </View>
                <Text style={styles.optionText}>{t('delete')}</Text>
              </TouchableOpacity>
            </View>

            <View>
              <Text style={styles.helpText}>{t('profile.help')}</Text>
              <Text style={styles.support}>support@jora.center</Text>
            </View>
          </View>
        </ScrollView>

        <Portal>
          <Dialog style={styles.modal} visible={visible} onDismiss={hideDialog}>
            <Dialog.Icon icon="alert" />
            <Dialog.Title style={styles.dialogTitle}>{t('modalDelete')}</Dialog.Title>
            <Dialog.Content>
              <Text style={styles.dialogText}>{t('titleModal')}</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button style={styles.dialogButton} onPress={hideDialog}>{t('no')}</Button>
              <Button
                style={styles.buttonDialog}
                onPress={() => {
                  hideDialog();
                  handleDeleteUser();
                }}
              >
                {t('yes')}
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scrollContent: {
    flexGrow: 1,
  },
  innerContent: {
    paddingVertical: 45,
    paddingHorizontal: 15,
    gap: 24.5,
  },
  notification: {
    alignItems: 'flex-end',
    marginBottom: 44.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },
  userInfo: {
    flexDirection: 'column',
  },
  name: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000',
  },
  phone: {
    fontSize: 12,
    color: 'rgba(23, 23, 23, 1)',
    fontWeight: '400',
  },
  profileSection: {
    gap: 15,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
    gap: 10,
    height: 60,
  },
  image: {
    backgroundColor: '#FFF2F2',
    width: 35,
    height: 35,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  icon: {
    width: 15,
    height: 15,
  },
  optionText: {
    fontSize: 16,
    color: 'rgba(31, 31, 31, 1)',
  },
  helpText: {
    fontWeight: '500',
    fontSize: 14,
    textAlign: 'right',
    color: 'rgba(23, 23, 23, 1)',
  },
  support: {
    color: 'rgba(235, 35, 40, 1)',
    fontSize: 13,
    textAlign: 'right',
    marginBottom: 30,
  },
  modal: {
    backgroundColor: '#FAFAFA',
  },
  dialogTitle: {
    textAlign: 'center',
    fontWeight: 'bold',
    color: '#EB2328',
  },
  dialogText: {
    textAlign: 'center',
    fontSize: 22,
  },
  dialogButton: {
    backgroundColor: '#fff',
    width: '50%',
  },
  buttonDialog: {
    backgroundColor: '#EB2328',
    width: '50%',
    color: '#fff',
  },
});

export default ProfileScreen;
