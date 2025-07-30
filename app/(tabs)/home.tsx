import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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

const capitalize = (str?: string) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

const HomeScreen = () => {
  const { t } = useTranslation();
  const isFocused = useIsFocused();
  const { user, loadUserFromStorage } = useUserStore();

  const [pdfList, setPdfList] = useState<Pdf[]>([]);
  const [selectedPdf, setSelectedPdf] = useState<Pdf | null>(null);
  const [isPdfModalVisible, setIsPdfModalVisible] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const barcodeUrl = `${API_BASE}/api/barcode/${user?.barcode || ''}`;

  const fetchPdfs = useCallback(async () => {
    try {
      const cached = await AsyncStorage.getItem('cachedPdfs');
      const cachedParsed: Pdf[] = cached ? JSON.parse(cached) : [];
      if (cachedParsed.length) setPdfList(cachedParsed);

      const res = await fetch(`${API_BASE}/api/pdfs`);
      const data: Pdf[] = await res.json();
      const sorted = data.sort(
        (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
      );

      if (sorted[0]?._id !== cachedParsed[0]?._id) {
        setPdfList(sorted);
        await AsyncStorage.setItem('cachedPdfs', JSON.stringify(sorted));
      }
    } catch (err) {
      console.error('Error fetching PDFs:', err);
    } finally {
      setLoading(false);
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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPdfs();
    setRefreshing(false);
  }, [fetchPdfs]);

  useEffect(() => {
    if (isFocused) {
      loadUserFromStorage();
      fetchNotificationCount();
      fetchPdfs();
    }
  }, [isFocused]);

  const openPdfModal = (pdf: Pdf) => {
    setSelectedPdf(pdf);
    setIsPdfModalVisible(true);
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      <FlatList
        data={pdfList}
        keyExtractor={(item) => item._id}
        numColumns={2}
        refreshing={refreshing}
        onRefresh={onRefresh}
        columnWrapperStyle={{ justifyContent: 'space-between' }}

        contentContainerStyle={styles.scrollContainer}
        ListHeaderComponent={
          <>
            <View style={globalStyles.notification}>
                {user?.firstName ? (
                  <TouchableOpacity
                    onPress={() => {
                      router.push('/components/notificationModal');
                    }}
                  >
                    <Image source={require('../../assets/images/notification.png')} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      router.push('../(auth)/logIn');
                    }}
                  >
                    <Image style={styles.logo} source={require('../../assets/images/logs.png')} />
                  </TouchableOpacity>
                )}

                {notificationCount > 0 && user?.firstName && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{notificationCount}</Text>
                  </View>
                )}
              </View>
            <View style={styles.header}>
              <Text style={globalStyles.title}>
                {t('home.title')}{' '}
                <Text style={styles.name}>{capitalize(user?.firstName)}</Text>,
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
                      source={require('../../assets/images/jora-guests.webp')}
                      style={globalStyles.guestsImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                </View>
                <View style={globalStyles.guestsImageWrapper}>
                  <TouchableOpacity onPress={() => router.push('/components/jora_services')}>
                    <Image
                      source={require('../../assets/images/jora-guests2.jpg')}
                      style={globalStyles.guestsImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                </View>
                <View style={globalStyles.guestsImageWrapper}>
                  <TouchableOpacity onPress={() => router.push('/components/privacy')}>
                    <Image
                      source={require('../../assets/images/location1.png')}
                      style={globalStyles.guestsImage}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                </View>
              </>
            )}
            <Text style={styles.sectionTitle}>{t('home.sectionTitle')}</Text>
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => openPdfModal(item)} style={styles.cardImage}>
            <View style={styles.pdfContainer}>
              <Image
                source={require('../../assets/images/fletushka.png')}
                style={{ width: '100%', height: 217, borderRadius: 5 }}
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
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#EB2328" style={{ marginTop: 30 }} />
          ) : (
            <Text style={{ textAlign: 'center', marginTop: 30 }}>
              {t('home.noPdfs') || 'No PDFs available.'}
            </Text>
          )
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
                accessible
                accessibilityLabel="Close PDF modal"
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
  cardImage: {
    width: '47%',
    paddingBottom: 30,
  },
  pdfContainer: {
    height: 217,
    width: '100%',
  },
  pdfName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#171717',
    textAlign: 'left',
    fontFamily: 'Poppins',
  },
  pdfSubtitle: {
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
  logo: {
    width: 40,
    paddingTop: 10,
    height: 40,
  },
});

export default HomeScreen;
