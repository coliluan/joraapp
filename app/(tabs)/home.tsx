// HomeScreen.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import * as Device from 'expo-device';
import * as DocumentPicker from 'expo-document-picker';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Button,
  FlatList,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { WebView } from 'react-native-webview';
import { API_BASE } from '../config/api';

// Lejo njoftimet të shfaqen edhe në lockscreen
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const HomeScreen = () => {
  const { t } = useTranslation();
  const isFocused = useIsFocused();

  const [userName, setUserName] = useState('');
  const [number, setNumber] = useState('');
  const [role, setRole] = useState<string>('');
  const [barcode, setBarcode] = useState('');
  const [pdfList, setPdfList] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isSecondModalVisible, setIsSecondModalVisible] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationBody, setNotificationBody] = useState('');
  const [pdfName, setPdfName] = useState('');
  const [pdfSubtitle, setPdfSubtitle] = useState('');
  const [pickedPdfFile, setPickedPdfFile] = useState<any>(null);
  const [selectedPdf, setSelectedPdf] = useState<any>(null);
  const [isPdfModalVisible, setIsPdfModalVisible] = useState(false);
const [notificationCount, setNotificationCount] = useState(0);

  const saveNotificationToStorage = async (title: string, body: string) => {
  try {
    const existing = await AsyncStorage.getItem('storedNotifications');
    const parsed = existing ? JSON.parse(existing) : [];
    const updated = [{ title, body, date: new Date().toISOString() }, ...parsed];
    await AsyncStorage.setItem('storedNotifications', JSON.stringify(updated));
  } catch (error) {
    console.error('Gabim gjatë ruajtjes së njoftimit:', error);
  }
};
  const registerForPushNotificationsAsync = async () => {
    try {
      if (!Device.isDevice) {
        console.log('Push notifications not supported on this device');
        return;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        Alert.alert('Push Notifications', 'Permission not granted');
        return;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync();
      const expoPushToken = tokenData.data;
      console.log('Expo Push Token:', expoPushToken);

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return expoPushToken;
    } catch (error) {
      console.error('Error during push notification registration:', error);
    }
  };

  const sendPushTokenToBackend = async (userId: string, token: string) => {
    try {
      await fetch(`${API_BASE}/api/store-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, userId }),
      });
    } catch (error) {
      console.error('Error sending token to backend:', error);
    }
  };



 useEffect(() => {
  const initialize = async () => {
    try {
      const userData = await AsyncStorage.getItem('loggedInUser');
      if (userData) {
        const parsed = JSON.parse(userData);
        setUserName(parsed.firstName);
        setNumber(parsed.number);
        setBarcode(parsed.barcode);
        setRole(parsed.role);

        const token = await registerForPushNotificationsAsync();
        if (token) {
          await sendPushTokenToBackend(parsed._id, token);
        }
      }

      const cached = await AsyncStorage.getItem('cachedPdfs');
      if (cached) {
        setPdfList(JSON.parse(cached));
      }

      const res = await fetch(`${API_BASE}/api/pdfs`);
      const data = await res.json();
      setPdfList(data);
      await AsyncStorage.setItem('cachedPdfs', JSON.stringify(data));

      // ⬅ Thirr edhe fetchNotificationCount këtu brenda
      await fetchNotificationCount();

    } catch (error) {
      console.error('Initialization error:', error);
    }
  };

  if (isFocused) {
    initialize(); // Tani është e dukshme këtu
  }
}, [isFocused]);

const fetchNotificationCount = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/notifications`);
    const data = await res.json();
    const lastSeenCount = parseInt(await AsyncStorage.getItem('lastSeenNotificationCount') || '0');
    const unseenCount = Math.max(data.length - lastSeenCount, 0);
    setNotificationCount(unseenCount);
  } catch (error) {
    console.error('Gabim gjatë marrjes së numrit të njoftimeve:', error);
  }
};


  const pickPDF = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: 'application/pdf' });
      if (!res.canceled) {
        const file = res.assets?.[0];
        setPickedPdfFile(file);
        setPdfName('');
        setPdfSubtitle('');
        setIsModalVisible(true);
      }
    } catch (err) {
      console.error('Error picking PDF:', err);
    }
  };

  const uploadPDF = async () => {
    if (!pickedPdfFile || !pdfName.trim()) {
      alert('Please enter a title for the PDF');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: pickedPdfFile.uri,
        name: pickedPdfFile.name,
        type: 'application/pdf',
      } as any);
      formData.append('customName', pdfName.trim());
      formData.append('customSubtitle', pdfSubtitle.trim());

      const response = await fetch(`${API_BASE}/api/upload-pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: formData,
      });

      const result = await response.json();
      console.log('Upload result:', result);

      setIsModalVisible(false);
      setPickedPdfFile(null);
      setPdfName('');
      setPdfSubtitle('');

      // Përditëso PDF listën
      const updated = await fetch(`${API_BASE}/api/pdfs`);
      const allPdfs = await updated.json();

      // Rendit PDF sipas datës (më të reja më parë)
      const sortedPdfs = allPdfs.sort(
        (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setPdfList(sortedPdfs);
      await AsyncStorage.setItem('cachedPdfs', JSON.stringify(sortedPdfs));
    } catch (err) {
      console.error('Error uploading PDF:', err);
    }
  };

  const openPdfModal = (pdf: any) => {
    setSelectedPdf(pdf);
    setIsPdfModalVisible(true);
  };

  const sendNotification = async () => {
  if (!notificationTitle.trim() || !notificationBody.trim()) {
    Alert.alert('Gabim', 'Ju lutem plotësoni titullin dhe përmbajtjen.');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/api/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: notificationTitle,
        body: notificationBody,
      }),
    });

    const result = await response.json();
    Alert.alert('Sukses', result.message || 'Njoftimi u dërgua!');
    await saveNotificationToStorage(notificationTitle, notificationBody);

    // Pas dërgimit: pastro inputet dhe mbyll modalin
    setNotificationTitle('');
    setNotificationBody('');
    setIsSecondModalVisible(false);
  } catch (error) {
    console.error('Gabim gjatë dërgimit të njoftimit:', error);
    Alert.alert('Gabim', 'Nuk u dërgua push notification');
  }
};


  const capitalizeFirstLetter = (str: string) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

  const barcodeUrl = `${API_BASE}/api/barcode/${barcode}`;

  return (
    <>
      <FlatList
        data={[]}
        renderItem={null}
        contentContainerStyle={styles.scrollContainer}
        ListHeaderComponent={
          <>
            <View style={styles.notification}>
              <TouchableOpacity onPress={() => router.push('/components/notificationModal')}>
              <Image source={require('../../assets/images/notification.png')} />
            </TouchableOpacity>
            {notificationCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{notificationCount}</Text>
              </View>
            )}
            </View>
            <View style={styles.header}>
              <Text style={styles.greeting}>
                {t('home.title')} <Text style={styles.name}>{capitalizeFirstLetter(userName)}</Text>,
              </Text>
              <Text style={styles.phone}>{number}</Text>
            </View>

            <Image source={{ uri: barcodeUrl }} style={styles.barcode} />
            <Text style={styles.sectionTitle}>{t('home.sectionTitle')}</Text>
          </>
        }
        ListFooterComponent={
          <View>
            {pdfList.length === 0 ? (
              <Text style={{ textAlign: 'center', marginTop: 20 }}>Loading PDFs...</Text>
            ) : (
              <FlatList
                data={pdfList}
                keyExtractor={(item) => item._id}
                numColumns={2}
                contentContainerStyle={styles.card}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => openPdfModal(item)} style={styles.cardImage}>
                    <View style={styles.pdfContainer}>
                      {/* <PdfThumbnail pdfId={item._id} /> */}
                      <WebView
                        key={isFocused ? `fullscreen-${selectedPdf?._id}` : `fullscreen-unfocused`}
                         source={{
    uri:
      Platform.OS === 'android'
        ? `https://docs.google.com/gview?embedded=true&url=${API_BASE}/api/pdf/${item._id}`
        : `${API_BASE}/api/pdf/${item._id}`,
  }}
                        useWebKit
                        startInLoadingState
                        originWhitelist={['*']}
                        style={{ borderRadius: 5, flex: 1 }}
                        scrollEnabled={false}
                      />
                    </View>
                    <Text style={styles.pdfName}>
                      {item.customName || item.name || item.filename || 'Untitled PDF'}
                    </Text>
                    {item.customSubtitle && (
                      <Text style={styles.pdfSubtitle}>{item.customSubtitle}</Text>
                    )}
                  </TouchableOpacity>
                )}
              />
            )}

            {role === 'admin' && (
              <>
                <View style={styles.button}>
                  <Button color='white' title="Ngarko një PDF" onPress={pickPDF} />
                </View>
                <View style={styles.button}>
                  <Button color='white' title="Dergo një Njoftim" onPress={() => setIsSecondModalVisible(true)} />
                </View>
              </>
            )}
          </View>
        }
      />

      {/* Modal për ngarkim PDF */}
      {role === 'admin' && (
        <>
        <Modal visible={isModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Enter title and subtitle for the PDF</Text>
              <TextInput
                placeholder="Title"
                value={pdfName}
                onChangeText={setPdfName}
                style={styles.input}
              />
              <TextInput
                placeholder="Subtitle"
                value={pdfSubtitle}
                onChangeText={setPdfSubtitle}
                style={styles.input}
              />
              <View style={styles.notificationsButton}>
                <View style={styles.dialogButton}>
                <Button title="Anulo" onPress={() => setIsModalVisible(false)} />
              </View>
              <View style={styles.buttonDialog}>
              <Button color="white" title="Ngarko" onPress={uploadPDF} />
              </View>
              </View>
            </View>
          </View>
        </Modal>
        <Modal visible={isSecondModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Send Push Notification</Text>
              <TextInput 
                placeholder="Titulli i njoftimit"
                placeholderTextColor="black"
                value={notificationTitle}
                onChangeText={setNotificationTitle}
                style={styles.input}
              />
              <TextInput
                placeholder="Përmbajtja e njoftimit"
                value={notificationBody}
                onChangeText={setNotificationBody}
                style={styles.input}
                placeholderTextColor="black"
              />
              <View style={styles.notificationsButton}>
                <View style={styles.dialogButton}>
                <Button title="Anulo" onPress={() => setIsSecondModalVisible(false)} />
              </View>
              <View style={styles.buttonDialog}>
              <Button color="white" title="Dërgo" onPress={sendNotification} />
              </View>
              </View>
            </View>
          </View>
        </Modal>
        </>
      )}

      {/* Modal për shfaqje PDF në fullscreen */}
      <Modal visible={isPdfModalVisible} animationType="slide">
        <View style={{ flex: 1 }}>
          {selectedPdf && (
            <>
              <WebView
                source={{ uri: `${API_BASE}/api/pdf/${selectedPdf._id}` }}
                useWebKit
                startInLoadingState
                originWhitelist={['*']}
                style={{ flex: 1 }}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={true}
                allowsProtectedMedia={true}
                 onShouldStartLoadWithRequest={(request) => {
    // Parandalo shkarkimin automatik
    return true;
  }}
              />
              <TouchableOpacity
                onPress={() => setIsPdfModalVisible(false)}
                style={{
                  position: 'absolute',
                  top: 50,
                  right: 20,
                  zIndex: 1,
                  backgroundColor: 'rgba(255,255,255,0.7)',
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                }}
              >
                <Text style={{ fontSize: 16, color: 'red', fontWeight: 'bold' }}>Mbyll</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 45,
    paddingBottom: 65,
    backgroundColor: '#FAFAFA',
  },
  notification: {
    alignItems: 'flex-end',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#EB2328',
    width: '100%',
    padding: 10,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 5
  },
  header: {
    marginBottom: 27,
  },
  greeting: {
    fontSize: 18,
    fontWeight: '500',
    color: '#171717',
    fontFamily: 'Poppins',
  },
  name: {
    color: '#EB2328',
    fontWeight: '500',
    fontSize: 18,
  },
  phone: {
    color: '#171717',
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Poppins-Regular',
  },
  barcode: {
    width: '100%',
    height: 60,
    marginBottom: 41,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#171717',
    marginBottom: 15,
  },
  card: {
    flex: 1,
    borderRadius: 10,
    marginBottom: 20,
  },
  cardImage: {
    width: '50%',
    paddingBottom: 30,
  },
  pdfContainer: {
    paddingHorizontal: 17.5,
    height: 217,
  },
  pdfName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#171717',
    textAlign: 'left',
    fontFamily: 'Poppins',
    paddingHorizontal: 17.5,
  },
  pdfSubtitle: {
    paddingHorizontal: 17.5,
    fontSize: 10,
    fontWeight: '400',
    color: '#EB2328',
    fontFamily: 'Poppins',
    textAlign: 'left',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  pdfThumbnail: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 5,
    overflow: 'hidden',
  },
  pdfIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  pdfPreviewText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  pdfLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  notificationsButton: {
    marginTop:20,
    width:'100%',
    flexDirection: 'row',
    gap:10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  dialogButton: {
    backgroundColor: '#fff',
    width: '50%',
    borderRadius: 5,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonDialog: {
    backgroundColor: '#EB2328',
    width: '50%',
    borderRadius: 5,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center'
  },
  input: {
    backgroundColor: '#FFF',
    height: 60,
    paddingHorizontal: 20,
    paddingVertical: 10,
    fontSize: 18,
    color: '#1F1F1F',
    marginBottom: 10,
  },
  badge: {
  position: 'absolute',
  top: -5,
  right: -5,
  backgroundColor: '#EB2328',
  borderRadius: 10,
  width: 20,
  height: 20,
  justifyContent: 'center',
  alignItems: 'center',
},
badgeText: {
  color: '#fff',
  fontSize: 12,
  fontWeight: 'bold',
},

});

export default HomeScreen;
