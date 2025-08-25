import { globalStyles } from '@/assets/globalStyles';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {
  Button,
  Dialog,
  PaperProvider,
  Portal
} from 'react-native-paper';
import NotifyIcon from '../../assets/images/notification.svg';
import LogoutIcon from '../../assets/images/pencil-logout.svg';
import ShoppingCartIcon from '../../assets/images/shopping-cart.svg';
import LoginModal from '../components/loginModal';
import { useUserStore } from '../store/useUserStore';

const ProfileScreen = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, isLoggedIn, setUser, loadUserFromStorage } = useUserStore();
  const [visible, setVisible] = React.useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false); 

  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);


  const [shouldRedirect, setShouldRedirect] = React.useState(false);
  
  useEffect(() => {
    if (shouldRedirect) {
      router.replace('/');
    }
  }, [shouldRedirect, router]);

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
      label: 'Adresa e transportit',
      icon: require('../../assets/images/location.png'),
      screen: '../(auth)/profile/location_address',
    },
    {
      label: t('placeHolder'),
      icon: require('../../assets/images/password.png'),
      screen: '../(auth)/profile/password',
    },
  ] as const;

  const bottomOptions = [
    {
      label: t('profile.lang'),
      icon: require('../../assets/images/language.png'),
      isSvg: false,
      screen: '../(auth)/profile/language',
    },
  ] as const;

  const toggleNotifications = () => setNotificationsEnabled(prevState => !prevState);

  const handleLogout = () => {
  setUser(null);
  setShouldRedirect(true);
  hideDialog();
};

  return (
    <PaperProvider>
      <View style={styles.container}>
        {(!isLoggedIn || !user || user?.isGuest) ? (
          <LoginModal />
        ) : (
          <>
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <View style={styles.innerContent}>
                <View style={styles.header}>
                  <View style={styles.leftHeader}>
                    <Image
                      source={
                        user.photo
                          ? { uri: user.photo.startsWith('data:image') ? user.photo : `data:image/jpeg;base64,${user.photo}` }
                          : require('../../assets/images/unknown-profile.jpg')
                      }
                      style={styles.avatar}
                    />
                    <View style={styles.userInfo}>
                      <Text style={styles.name}>{capitalizeFirstLetter(user.firstName)}</Text>
                      <Text style={globalStyles.phone}>{user.number || ''}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.shoppingCart} onPress={showDialog}>
                    <LogoutIcon width={42} height={42} />
                  </TouchableOpacity>
                </View>
                <View style={styles.profileSection}>
                  <TouchableOpacity style={styles.cartButton}>
                    <View style={styles.image}>
                      <ShoppingCartIcon width={15} height={15} fill="#EB2328" />
                    </View>
                    <Text style={styles.optionText}>Shporta (1)</Text>
                  </TouchableOpacity>
                  <View style={styles.optionSection} >
                  <View><Text style={styles.title}>Të pëgjithshme</Text></View>
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
                  </View>
                  
                  <View style={styles.optionSection} >
                     <View><Text style={styles.title}>Preferencat</Text></View>
                 {bottomOptions.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.option}
                      onPress={() => router.push({ pathname: item.screen })}
                    >
                      <View style={styles.image}>
                        {item.isSvg ? (
                          <item.icon width={15} height={15} />
                        ) : (
                          <Image source={item.icon} style={styles.icon} />
                        )}
                      </View>
                      <Text style={styles.optionText}>{item.label}</Text>
                    </TouchableOpacity>
                  ))}
                  <View style={styles.notificationSwitch}>
                    <View style={styles.switchSection} >
                      <View style={styles.image}>
                        <NotifyIcon style={styles.icon} width={20} height={20} />
                        
                      </View>
                      <Text style={styles.optionText}>Njoftimet</Text>
                    </View>
                    <View>
                      <Switch
                      trackColor={{ false: "#d3d3d3", true: "#FF4C4C" }} 
                      thumbColor={notificationsEnabled ? "#FFFFFF" : "#f4f3f4"}
                      onValueChange={toggleNotifications}
                      value={notificationsEnabled}
                      style={styles.customSwitch}
                    />
                    </View>
                  </View>
                  </View>
                </View>
                <View style={styles.supportSection}>
                  <View style={styles.supportCenter}>
                  <Text style={styles.helpText}>{t('profile.help')}</Text>
                  <Text style={styles.support} onPress={handleEmailPress}>
                    support@jora.center
                  </Text>
                </View>
                </View>
              </View>
            </ScrollView>
            <Portal>
              <Dialog style={globalStyles.modal} visible={visible} onDismiss={hideDialog}>
                <Dialog.Icon icon="alert" />
                <Dialog.Title style={globalStyles.dialogTitle}>
                  {t('modalRemove')}
                  JO
                  </Dialog.Title>
                <Dialog.Content>
                  <Text style={globalStyles.dialogText}>{t('titleRemoveModal')}</Text>
                </Dialog.Content>
                <Dialog.Actions>
                  <Button style={globalStyles.dialogButton} onPress={hideDialog}>
                    {/* {t('no')} */}
                    JO
                  </Button>
                  <Button style={globalStyles.dialogButton} onPress={handleLogout}>
                    {/* {t('no')} */}
                    PO
                  </Button>
                </Dialog.Actions>
              </Dialog>
            </Portal>
          </>
        )}
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
    paddingVertical: 30,
    paddingHorizontal: 15,
    gap: 24.5,
    position: 'relative',
  },
  header: {
    paddingVertical: 15,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftHeader: {
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
  optionSection:{
    backgroundColor: '#FFFFFF',
    marginVertical: 15,
  },
  profileSection: {},
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
  cartButton: {
    borderWidth: 1,
    borderColor: '#EB2328',
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
  title: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1F1F1F',
    padding: 15,
  },
supportSection: {
  width: '100%',
  alignItems: 'flex-end',
  marginTop: 30,
  marginBottom: 30,
},
supportCenter: {
  backgroundColor: '#FFFFFF',
  paddingTop: 25,
  alignItems: 'center',
  justifyContent: 'center',
  width: 183,
  height: 76,
  elevation: 2,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.04,
  shadowRadius: 18,
  position: 'absolute',
  bottom: 100,
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
  notificationSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 15,
  },
  switchSection: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  customSwitch: {
    transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }], 
  },
  shoppingCart: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProfileScreen;
