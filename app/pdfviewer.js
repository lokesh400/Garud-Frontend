// app/pdfviewer.js
import { useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Pdf from 'react-native-pdf';
import * as FileSystem from 'expo-file-system';

export default function PdfViewer() {
  const params = useLocalSearchParams(); // ✅ Like req.params
  const router = useRouter();

  const uri = decodeURIComponent(params.uri || '');
  const title = params.title || 'PDF Viewer';

  const source = { uri, cache: true };

  const handleDelete = async () => {
    try {
      await FileSystem.deleteAsync(uri, { idempotent: true });
      Alert.alert('Deleted', 'PDF has been deleted.');
      router.back();
    } catch (error) {
      console.error('Delete failed:', error);
      Alert.alert('Error', 'Failed to delete the file.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text numberOfLines={1} style={styles.title}>{title}</Text>
      </View>

      {/* PDF View */}
      <Pdf
        source={source}
        style={styles.pdf}
        onLoadComplete={(pages) => console.log(`Loaded PDF with ${pages} pages`)}
        onError={(error) => {
          console.log('PDF load error:', error);
          Alert.alert('Error', 'Unable to load PDF');
        }}
      />

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Delete PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: '#fff',
    elevation: 3,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  backText: {
    fontSize: 16,
    marginLeft: 6,
    color: '#333',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flexShrink: 1,
  },

  pdf: {
    flex: 1,
    width: '100%',
    backgroundColor: '#fff',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#eee',
  },
  deleteButton: {
    backgroundColor: '#d9534f',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: 'bold',
  },
});