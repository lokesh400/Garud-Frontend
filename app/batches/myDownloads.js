import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system';

export default function MyDownloads() {
  const [groupedDownloads, setGroupedDownloads] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Extract batch ID from filename using regex
  const extractBatchId = (filename) => {
    const match = filename.match(/\(([^)]+)\)$/);
    return match ? match[1] : 'unknown';
  };

  const extractTitle = (filename) => {
    const match = filename.match(/\/([^/]+)\(/);
    return match ? match[1] : filename;
  };

  useEffect(() => {
    const loadDownloads = async () => {
      try {
        const files = await FileSystem.readDirectoryAsync(
          FileSystem.documentDirectory || FileSystem.cacheDirectory
        );

        const fullFiles = await Promise.all(
          files.map(async (filename) => {
            const uri = `${FileSystem.documentDirectory}${filename}`;
            const info = await FileSystem.getInfoAsync(uri);
            if (!info.exists || !filename.endsWith('.pdf')) return null;

            const batchId = extractBatchId(filename);
            const title = extractTitle(filename);

            return {
              uri,
              title,
              batchId,
              date: info.modificationTime || Date.now(),
            };
          })
        );

        const validFiles = fullFiles.filter(Boolean);

        const grouped = {};
        for (const file of validFiles) {
          if (!grouped[file.batchId]) grouped[file.batchId] = [];
          grouped[file.batchId].push(file);
        }

        setGroupedDownloads(grouped);
      } catch (error) {
        console.error("Error reading downloads:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDownloads();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {Object.keys(groupedDownloads).length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No downloads found</Text>
        </View>
      ) : (
        Object.entries(groupedDownloads).map(([batchId, files]) => (
          <View key={batchId} style={styles.batchSection}>
            <Text style={styles.batchTitle}>Batch ID: {batchId}</Text>
            {files.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.downloadItem}
                onPress={() =>
                  router.push({
                    pathname: '/pdfviewer',
                    params: { 
                      uri: item.uri,
                      title: item.title },
                  })
                }
              >
                <Text style={styles.downloadTitle}>{item.title}</Text>
                <Text style={styles.downloadDate}>
                  {new Date(item.date).toLocaleDateString()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
  },
  batchSection: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    elevation: 2,
  },
  batchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6b28ad',
    marginBottom: 12,
  },
  downloadItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  downloadTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  downloadDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});
