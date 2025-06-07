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

  if (loading) return <ActivityIndicator style={{ marginTop: 50 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{batch.title}</Text>

      {/* Navigation buttons */}
      <View style={styles.nav}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "announcements" && styles.activeTab,
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

        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "tests" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("tests")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "tests" && styles.activeTabText,
            ]}
          >
            Show Tests
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === "announcements" ? (
        <FlatList
          data={announcements}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <Text style={styles.announcementItem}>• {item}</Text>
          )}
          ListEmptyComponent={<Text>No announcements available.</Text>}
          style={{ marginTop: 12 }}
        />
      ) : (
        <FlatList
          data={batch.tests}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.testCard}>
              <Text style={styles.testTitle}>{item.title}</Text>

              <View style={styles.buttonsRow}>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() => {
                    router.push(`/test/${item.id}`);
                  }}
                >
                  <Text style={styles.buttonText}>Attempt Test</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => {
                    // Show result logic here
                    Alert.alert("Result", "Show result functionality coming soon.");
                  }}
                >
                  <Text style={styles.buttonText}>Show Result</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text>No tests available.</Text>}
          style={{ marginTop: 12 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  header: { fontSize: 24, fontWeight: "bold", marginBottom: 12, color: "#222" },
  nav: { flexDirection: "row", justifyContent: "space-around", marginBottom: 12 },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: "#007AFF",
  },
  tabText: {
    color: "#444",
    fontWeight: "bold",
  },
  activeTabText: {
    color: "#fff",
  },
  announcementItem: {
    fontSize: 16,
    marginVertical: 6,
    color: "#444",
  },
  testCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    // Shadow for iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    // Elevation for Android
    elevation: 3,
  },
  testTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 12,
    color: "#111",
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  primaryButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "#aaa",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
