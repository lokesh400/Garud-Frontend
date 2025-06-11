import { useState, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import Pdf from 'react-native-pdf';
import { useLocalSearchParams } from 'expo-router';
import * as FileSystem from 'expo-file-system';

export default function PDFViewer() {
  const { uri, title } = useLocalSearchParams();
  const [fileUri, setFileUri] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setFileUri(uri);
    setLoading(false);
  }, [uri]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {fileUri && (
        <Pdf
          source={{ uri: fileUri, cache: true }}
          style={styles.pdf}
          onLoadComplete={(numberOfPages) => {
            console.log(`Number of pages: ${numberOfPages}`);
          }}
          onError={(error) => {
            console.log(error);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pdf: {
    flex: 1,
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});