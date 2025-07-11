import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { API_BASE } from '../config/api';

interface PdfThumbnailProps {
  pdfId: string;
  onPress?: () => void;
}

const PdfThumbnail: React.FC<PdfThumbnailProps> = ({ pdfId, onPress }) => {
  return (
    <View style={styles.container}>
      <WebView
        key={`thumbnail-${pdfId}`}
        source={{ uri: `${API_BASE}/api/pdf/${pdfId}` }}
        useWebKit
        startInLoadingState
        originWhitelist={['*']}
        style={styles.thumbnail}
        scrollEnabled={false}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        allowsProtectedMedia={true}
        onShouldStartLoadWithRequest={(request) => {
          // Lejo vetëm ngarkimin e PDF-it nga backend-i ynë
          return request.url.includes(API_BASE);
        }}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <Text style={styles.icon}>📄</Text>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}
        renderError={() => (
          <View style={styles.errorContainer}>
            <Text style={styles.icon}>📄</Text>
            <Text style={styles.errorText}>PDF Preview</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 5,
    overflow: 'hidden',
  },
  thumbnail: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  icon: {
    fontSize: 32,
    marginBottom: 4,
  },
  loadingText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
});

export default PdfThumbnail; 