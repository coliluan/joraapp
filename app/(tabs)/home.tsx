// HomeScreen.tsx

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import * as Device from 'expo-device';
import * as DocumentPicker from 'expo-document-picker';
import * as Notifications from 'expo-notifications';
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
import PdfThumbnail from '../components/PdfThumbnail';
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
  const [pdfName, setPdfName] = useState('');
  const [pdfSubtitle, setPdfSubtitle] = useState('');
  const [pickedPdfFile, setPickedPdfFile] = useState<any>(null);
  const [selectedPdf, setSelectedPdf] = useState<any>(null);
  const [isPdfModalVisible, setIsPdfModalVisible] = useState(false);
  const [pushToken, setPushToken] = useState(''); 
  const [parsedUser, setParsedUser] = useState<any>(null);

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
      setPushToken(expoPushToken);
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

  const sendPushNotification = async (expoPushToken: string, title: string, body: string) => {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title,
      body,
      data: { someData: 'goes here' },
    };

    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-Encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
      console.log('Push notification sent');
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        const userData = await AsyncStorage.getItem('loggedInUser');
        if (userData) {
          const parsed = JSON.parse(userData);
          setParsedUser(parsed);
          setUserName(parsed.firstName);
          setNumber(parsed.number);
          setBarcode(parsed.barcode);
          setRole(parsed.role);

          const token = await registerForPushNotificationsAsync();
          if (token) {
            await sendPushTokenToBackend(parsed._id, token);
          }

          const adminToken = await fetch(`${API_BASE}/api/get-admin-tokens`)
            .then((res) => res.json())
            .then((data) => data.tokens)
            .catch(() => []);

          if (adminToken && adminToken.length > 0) {
            for (const token of adminToken) {
              await sendPushNotification(
                token,
                'Përdorues i ri u kyç',
                `${parsed.firstName} sapo u kyç në aplikacion.`
              );
            }
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
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };

    if (isFocused) {
      initialize();
    }
  }, [isFocused]);

  const handleTestNotification = async () => {
    if (!pushToken || !parsedUser) {
      console.log('Token or user data missing');
      return;
    }

    await sendPushNotification(
      pushToken,
      'Mirësevini!',
      `Përshëndetje ${parsedUser.firstName}, shikoni ofertat e fundit per sot.`
    );
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
              <TouchableOpacity onPress={() => alert('Notifications clicked!')}>
                <Image source={require('../../assets/images/notification.png')} />
              </TouchableOpacity>
            </View>

            <View style={styles.header}>
              <Text style={styles.greeting}>
                {t('home.title')} <Text style={styles.name}>{userName}</Text>,
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
                      <PdfThumbnail pdfId={item._id} />
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
                  <Button title="Ngarko një PDF" onPress={pickPDF} />
                </View>
                <View style={[styles.button, { backgroundColor: 'green' }]}>
                  <Button
                    title="Test Notification"
                    color="white"
                    onPress={handleTestNotification}
                  />
                </View>
                <View style={[styles.button, { backgroundColor: 'blue' }]}>
                  <Button
                    title="Dërgo Push Notification"
                    color="white"
                    onPress={() => {
                      Alert.prompt(
                        'Push Notification',
                        'Shkruani mesazhin:',
                        [
                          { text: 'Anulo', style: 'cancel' },
                          {
                            text: 'Dërgo',
                            onPress: (message) => {
                              if (message) {
                                sendPushNotification(
                                  pushToken,
                                  'Mesazh nga Admin',
                                  message
                                );
                                Alert.alert('Sukses', 'Push notification u dërgua!');
                              }
                            }
                          }
                        ],
                        'plain-text'
                      );
                    }}
                  />
                </View>
                <View style={[styles.button, { backgroundColor: 'purple' }]}>
                  <Button
                    title="Dërgo te Të Gjithë"
                    color="white"
                    onPress={() => {
                      Alert.prompt(
                        'Broadcast Notification',
                        'Shkruani mesazhin për të gjithë përdoruesit:',
                        [
                          { text: 'Anulo', style: 'cancel' },
                          {
                            text: 'Dërgo',
                            onPress: async (message) => {
                              if (message) {
                                try {
                                  const response = await fetch(`${API_BASE}/api/notify`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      title: 'Mesazh nga Admin',
                                      body: message
                                    }),
                                  });
                                  const result = await response.json();
                                  Alert.alert('Sukses', result.message);
                                } catch (error) {
                                  Alert.alert('Gabim', 'Nuk u dërgua push notification');
                                }
                              }
                            }
                          }
                        ],
                        'plain-text'
                      );
                    }}
                  />
                </View>
              </>
            )}
          </View>
        }
      />

      {/* Modal për ngarkim PDF */}
      {role === 'admin' && (
        <Modal visible={isModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Enter title and subtitle for the PDF</Text>
              <TextInput
                placeholder="Title"
                value={pdfName}
                onChangeText={setPdfName}
                style={styles.textInput}
              />
              <TextInput
                placeholder="Subtitle"
                value={pdfSubtitle}
                onChangeText={setPdfSubtitle}
                style={styles.textInput}
              />
              <Button title="Upload PDF" onPress={uploadPDF} />
              <View style={{ height: 10 }} />
              <Button title="Cancel" onPress={() => setIsModalVisible(false)} color="red" />
            </View>
          </View>
        </Modal>
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
    backgroundColor: 'red',
    width: '100%',
    padding: 10,
    marginTop: 10,
    marginBottom: 20,
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
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: '#F4F4F4',
    padding: 12,
    marginVertical: 8,
    borderRadius: 6,
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
});

export default HomeScreen;
