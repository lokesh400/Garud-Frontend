import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  StatusBar,
  Platform,
  TextInput,
} from "react-native";
import { apiFetch,API_BASE } from "../../utils/api";
import { Ionicons } from '@expo/vector-icons';
import AppFooter from "../../components/AppFooter";
import { Linking } from 'react-native';

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [filteredBatches, setFilteredBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    apiFetch("/api/batches/my/purchased")
      .then((res) => res.json())
      .then((data) => {
        setBatches(data);
        setFilteredBatches(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredBatches(batches);
    } else {
      const filtered = batches.filter(batch =>
        batch.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.class.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredBatches(filtered);
    }
  }, [searchQuery, batches]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Custom Header */}
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Batches</Text>
          
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search batches..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>
      
      {/* Content Area */}
      <FlatList
        data={filteredBatches}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        style={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Image
              source={{ uri: item.thumbnail }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.infoContainer}>
              <Text style={styles.infoText}>Starts: {item.startingDate}</Text>
              <Text style={styles.infoText}>Class: {item.class}</Text>
            </View>
            <View style={{borderColor:"black",borderWidth:0.4,marginBottom:20}} ></View>
            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={() => router.push(`/batches/${item._id}`)}
              >
                <Text style={styles.buttonText}>Study</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-off" size={50} color="#ccc" />
            <Text style={styles.emptyText}>No batches found</Text>
          </View>
        }
      />
      
      <AppFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffff',
    paddingBottom: 60, // Add padding to prevent content from being hidden behind footer
  },
  headerSafeArea: {
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 15,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  clearButton: {
    marginLeft: 10,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    paddingTop: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: '#6b28ad',
  },
  secondaryButton: {
    backgroundColor: '#e0d6eb',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginTop: 10,
  },
});