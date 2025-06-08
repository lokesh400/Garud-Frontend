import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  StatusBar,
  Platform
} from "react-native";
import { apiFetch } from "../../utils/api";
import { useRouter } from "expo-router";

export default function BatchDetails() {
  const { id } = useLocalSearchParams();
  const [batch, setBatch] = useState(null);
  const [activeTab, setActiveTab] = useState("tests");
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    apiFetch(`/api/batches/${id}`)
      .then((res) => res.json())
      .then(setBatch)
      .catch((err) => {
        console.error(err);
        Alert.alert("Error", "Failed to load batch.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const fetchAnnouncements = async () => {
    try {
      const res = await apiFetch(`/batch/${id}/announcements`);
      const data = await res.json();
      setAnnouncements(data);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Unable to load announcements.");
    }
  };

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
      <SafeAreaView style={styles.safeArea}>
        {/* Custom Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{batch.title}</Text>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "tests" && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab("tests")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "tests" && styles.activeTabText,
              ]}
            >
              Tests
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "announcements" && styles.activeTabButton,
            ]}
            onPress={() => {
              setActiveTab("announcements");
              fetchAnnouncements();
            }}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "announcements" && styles.activeTabText,
              ]}
            >
              Announcements
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content Area */}
        <View style={styles.contentContainer}>
          {activeTab === "announcements" ? (
            announcements.length > 0 ? (
              <FlatList
                data={announcements}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <View style={styles.announcementCard}>
                    <Text style={styles.announcementText}>• {item}</Text>
                  </View>
                )}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No announcements available</Text>
              </View>
            )
          ) : batch.tests && batch.tests.length > 0 ? (
            <FlatList
              data={batch.tests}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.testList}
              renderItem={({ item }) => (
                <View style={styles.testCard}>
                  <Text style={styles.testTitle}>{item.title}</Text>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity
                      style={styles.secondaryButton}
                      onPress={() => router.push(`/test/report/${item.id}`)}
                    >
                      <Text style={styles.buttonText}>View Result</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.primaryButton}
                      onPress={() => router.push(`/test/${item.id}`)}
                    >
                      <Text style={styles.buttonText}>Attempt Test</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No tests available</Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  activeTabButton: {
    backgroundColor: '#6b28ad',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#ffffff',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  testList: {
    paddingBottom: 16,
  },
  testCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  announcementCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  announcementText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#6b28ad',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#e0d6eb',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
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
});