import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { globalStyles } from '../../assets/globalStyles';
import { API_BASE } from '../../config/api';
import { useUserStore } from '../store/useUserStore';

type Pdf = {
  _id: string;
  uploadedAt: string;
  customName?: string;
  customSubtitle?: string;
  [key: string]: any;
};

const HomeScreen = () => {
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const { user, loadUserFromStorage } = useUserStore();

  const [pdfList, setPdfList] = useState<Pdf[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<Pdf | null>(null);
  const [isPdfModalVisible, setIsPdfModalVisible] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  const barcodeUrl = `${API_BASE}/api/barcode/${user?.barcode || ''}`;

  const fetchPdfs = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/pdfs`);
      const data: Pdf[] = await res.json();
      const sorted = data.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
      setPdfList(sorted);
      await AsyncStorage.setItem('cachedPdfs', JSON.stringify(sorted));
    } catch (err) {
      console.error('Error fetching PDFs:', err);
    }
  }, []);

  const fetchNotificationCount = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/notifications`);
      const data = await res.json();
      const lastSeen = parseInt(await AsyncStorage.getItem('lastSeenNotificationCount') || '0');
      setNotificationCount(Math.max(data.length - lastSeen, 0));
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  }, []);

  useEffect(() => {
    if (isFocused) {
      loadUserFromStorage().then(async () => {
        if (user && user._id) {
          
        }
      });

      fetchNotificationCount();
      fetchPdfs();
    }
  }, [isFocused]);

  useEffect(() => {
    let interval: any;
    if (isFocused) {
      interval = setInterval(fetchPdfs, 15000);
    }
    return () => clearInterval(interval);
  }, [isFocused]);

  const openPdfModal = (pdf: Pdf) => {
    setSelectedPdf(pdf);
    setIsPdfModalVisible(true);
  };

  const capitalize = (str?: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <>
      <FlatList
        data={[]}
        renderItem={null}
        contentContainerStyle={styles.scrollContainer}
        ListHeaderComponent={
          <>
            <View style={globalStyles.notification}>
              <TouchableOpacity
                onPress={() => {
                  if (!user?.isGuest && user?.firstName) {
                    router.push('/components/notificationModal');
                  }
                }}
                disabled={user?.isGuest || !user?.firstName}
                
              >
                <Image source={require('../../assets/images/notification.png')} />
              </TouchableOpacity>
              {notificationCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{notificationCount}</Text>
                </View>
              )}
            </View>

            <View style={styles.header}>
              <Text style={globalStyles.title}>
                {t('home.title')} <Text style={styles.name}>{capitalize(user?.firstName)}</Text>,
              </Text>
              <Text style={globalStyles.phone}>{user?.number || ''}</Text>
            </View>

            {user?.barcode && (
              <Image source={{ uri: barcodeUrl }} style={styles.barcode} />
            )}

            {!user?.firstName && (
              <>
              <View style={globalStyles.guestsImageWrapper}>
                <TouchableOpacity onPress={() => router.push('/components/history')}>
                  <Image
                    source={require('../../assets/images/jora-guests.png')}
                    style={globalStyles.guestsImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
                  
                </View>
                <View  style={globalStyles.guestsImageWrapper}>
                  <TouchableOpacity onPress={() => router.push('/components/jora_services')}>
                    <Image 
                    source={require('../../assets/images/jora-guests2.jpg')}
                    style={globalStyles.guestsImage}
                    resizeMode="cover"
                  />
                  </TouchableOpacity>
                  
                </View>
                {/* <TouchableOpacity onPress={() => router.push('/components/jora_services')}>
                  <Image style={globalStyles.guestsImage} source={require('../../assets/images/jora-guests2.jpg')} />
                </TouchableOpacity> */}
              </>
            )}

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
                      <Image source={require('../../assets/images/fletushka.png')} style={{ width: '100%', height: 217, borderRadius: 5 }} />
                    </View>
                    <Text style={styles.pdfName}>{item.customName || item.name || item.filename || 'Untitled PDF'}</Text>
                    {item.customSubtitle && <Text style={styles.pdfSubtitle}>{item.customSubtitle}</Text>}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        }
      />

      <Modal visible={isPdfModalVisible} animationType="slide">
        <View style={{ flex: 1 }}>
          {selectedPdf && (
            <>
              <WebView
                source={{ uri: `${API_BASE}/api/pdf/${selectedPdf._id}` }}
                style={{ flex: 1 }}
                startInLoadingState
                originWhitelist={['*']}
              />
              <TouchableOpacity
                onPress={() => setIsPdfModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={{ fontSize: 16, color: 'red', fontWeight: 'bold' }}>{t('close')}</Text>
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
  header: {
    marginBottom: 27,
  },
  name: {
    color: '#EB2328',
    fontWeight: '500',
    fontSize: 18,
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
    width: '100%',
  },
  pdfImage: {
    flex: 1,
    borderRadius: 5,
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
  closeButton: {
    position: 'absolute',
    top: 72,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },

});

export default HomeScreen;
