import { globalStyles } from '@/assets/globalStyles';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Image,
  Linking,
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
import { ENDPOINTS, getApiUrl } from '../../config/api';
import LoginModal from '../components/loginModal';
import { useUserStore } from '../store/useUserStore';

const ProfileScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, isLoggedIn, setUser, logout, loadUserFromStorage } = useUserStore();
  const [visible, setVisible] = React.useState(false);

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

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

  const handleLogOutUser = async () => {
    try {
      await logout();
      Alert.alert('Sukses', 'U çkyçët me sukses.');
      router.replace('/');
    } catch (e) {
      Alert.alert('Gabim', 'Ndodhi një gabim gjatë çkyçjes.');
    }
  };

  const capitalizeFirstLetter = (str: string) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

  const handleEmailPress = () => {
    Linking.openURL('mailto:support@jora.center');
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

  if (!isLoggedIn || !user || user?.isGuest) {
    return <LoginModal />;
  }

  return (
    <PaperProvider>
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.innerContent}>
            <View style={globalStyles.notification}>
              <TouchableOpacity onPress={() => router.push('/components/notificationModal')}>
                <Image source={require('../../assets/images/notification.png')} />
              </TouchableOpacity>
            </View>

            <View style={styles.header}>
              <TouchableOpacity onPress={pickImage}>
                <Image
                  source={
                    user.photo
                      ? { uri: user.photo }
                      : require('../../assets/images/unknown-profile.jpg')
                  }
                  style={styles.avatar}
                />
              </TouchableOpacity>

              <View style={styles.userInfo}>
                <Text style={styles.name}>{capitalizeFirstLetter(user.firstName)}</Text>
                <Text style={globalStyles.phone}>{user.number || ''}</Text>
              </View>
            </View>

            <View style={styles.profileSection}>
              {options.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.option}
                  onPress={() => router.push({ pathname: item.screen })}
                >
                  <View style={styles.image}>
                    <Image source={item.icon} style={styles.icon} />
                  </View>
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity style={styles.option} onPress={showDialog}>
                <View style={styles.image}>
                  <Image source={require('../../assets/images/trash.png')} style={styles.icon} />
                </View>
                <Text style={styles.optionText}>{t('logout')}</Text>
              </TouchableOpacity>
            </View>

            <View>
              <Text style={styles.helpText}>{t('profile.help')}</Text>
              <Text style={styles.support} onPress={handleEmailPress}>
                support@jora.center
              </Text>
            </View>
          </View>
        </ScrollView>

        <Portal>
          <Dialog style={globalStyles.modal} visible={visible} onDismiss={hideDialog}>
            <Dialog.Icon icon="alert" />
            <Dialog.Title style={globalStyles.dialogTitle}>{t('modalRemove')}</Dialog.Title>
            <Dialog.Content>
              <Text style={globalStyles.dialogText}>{t('titleRemoveModal')}</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button style={globalStyles.dialogButton} onPress={hideDialog}>
                {t('no')}
              </Button>
              <Button style={globalStyles.buttonDialog} onPress={handleLogOutUser}>
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
    paddingVertical: 10,
    fontSize: 18,
  },
});

export default ProfileScreen;
