import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Pdf from 'react-native-pdf';
import * as Progress from 'react-native-progress';
import { Ionicons } from '@expo/vector-icons';

export default function PDFViewer() {
  const { uri, title } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{title || "PDF Viewer"}</Text>
        <View style={{ width: 24 }} /> {/* Placeholder for symmetry */}
      </View>

      {/* PDF Viewer */}
      <View style={styles.pdfContainer}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <Progress.Bar progress={progress} width={200} />
            <Text style={styles.loadingText}>Loading PDF...</Text>
          </View>
        )}
        <Pdf
          source={{ uri }}
          onLoadProgress={(p) => setProgress(p)}
          onLoadComplete={() => setLoading(false)}
          onError={(error) => {
            console.error(error);
            setLoading(false);
          }}
          style={styles.pdf}
          trustAllCerts={true}
          spacing={8}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  header: {
    height: 56,
    backgroundColor: '#6b28ad',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  pdfContainer: {
    flex: 1,
  },
  pdf: {
    flex: 1,
    width: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: '45%',
    alignItems: 'center',
    alignSelf: 'center',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 8,
    color: '#444',
  },
});
