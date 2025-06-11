import { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
// import { getDownloadsByBatch } from '../utils/downloadsManager';

export default function MyDownloads() {
  const [allDownloads, setAllDownloads] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadDownloads = async () => {
      const downloadsByBatch = await getDownloadsByBatch(); // assumed: { batchId: [items] }
      const flattenedDownloads = Object.entries(downloadsByBatch).flatMap(([batchId, files]) =>
        files.map(file => ({
          ...file,
          batchId,
        }))
      );
      setAllDownloads(flattenedDownloads);
      setLoading(false);
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
    <View style={styles.container}>
      {allDownloads.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No downloads yet</Text>
        </View>
      ) : (
        <FlatList
          data={allDownloads}
          keyExtractor={(item, index) => `${item.uri}_${index}`}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.downloadItem}
              onPress={() => router.push({
                pathname: '/pdf-viewer',
                params: { uri: item.uri, title: item.title }
              })}
            >
              <Text style={styles.downloadTitle}>{item.title}</Text>
              <Text style={styles.downloadDate}>
                Batch: {item.batchId} | Downloaded: {new Date(item.date).toLocaleDateString()}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
  },
  downloadItem: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  downloadTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  downloadDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});
