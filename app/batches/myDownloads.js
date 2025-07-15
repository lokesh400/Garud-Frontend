import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';

export default function MyDownloads() {
  const [groupedDownloads, setGroupedDownloads] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const extractBatchId = (filename) => {
    const match = filename.match(/\(([^)]+)\)/); // capture inside parentheses
    return match ? match[1] : 'unknown';
  };

  const extractTitle = (filename) => {
    return filename
      .replace(/\.pdf(\(.*\))?$/, '') // remove ".pdf" and optional "(...)"
      .replace(/_/g, ' ') // replace underscores with spaces
      .trim();
  };

  useEffect(() => {
    const loadDownloads = async () => {
      const directories = [FileSystem.documentDirectory, FileSystem.cacheDirectory];
      let allFiles = [];

      try {
        for (const dir of directories) {
          if (!dir) continue;

          const files = await FileSystem.readDirectoryAsync(dir);
          console.log(`Reading from: ${dir}`, files);

          const fileDetails = await Promise.all(
            files.map(async (filename) => {
              if (!filename.match(/\.pdf(\([^)]+\))?$/)) return null; // fix: allow .pdf(...)

              const uri = dir + filename;
              const info = await FileSystem.getInfoAsync(uri);
              if (!info.exists) return null;

              return {
                uri,
                title: extractTitle(filename),
                batchId: extractBatchId(filename),
                date: info.modificationTime || Date.now(),
              };
            })
          );

          allFiles.push(...fileDetails.filter(Boolean));
        }

        // Sort newest first
        allFiles.sort((a, b) => b.date - a.date);

        // Group by batchId
        const grouped = {};
        for (const file of allFiles) {
          if (!grouped[file.batchId]) grouped[file.batchId] = [];
          grouped[file.batchId].push(file);
        }

        setGroupedDownloads(grouped);
      } catch (err) {
        console.error('Failed to load files:', err);
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
            {files.map((file, index) => (
              <TouchableOpacity
                key={index}
                style={styles.downloadItem}
                onPress={() =>
                  router.push({
                    pathname: '/pdfviewer',
                    params: {
                      uri: file.uri,
                      title: file.title,
                    },
                  })
                }
              >
                <Text style={styles.downloadTitle}>{file.title}</Text>
                <Text style={styles.downloadDate}>
                  {new Date(file.date).toLocaleDateString()}
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
