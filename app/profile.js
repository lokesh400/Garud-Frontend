import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { apiFetch } from "../utils/api"; // Adjust path if needed

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data from API on component mount
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await apiFetch("/api/user"); // Change path to your actual user API endpoint
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error(error);
        Alert.alert("Error", "Failed to load user profile.");
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  if (loading)
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" style={{ marginTop: 50 }} />
      </SafeAreaView>
    );

  if (!user)
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ marginTop: 50, textAlign: "center" }}>
          No user data found.
        </Text>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <Text style={styles.name}>{user.name || user.username}</Text>
          <Text style={styles.role}>{user.role}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.value}>{user.email}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Phone:</Text>
            <Text style={styles.value}>{user.contactNumber}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Address:</Text>
            <Text style={styles.value}>{user.address}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff",padding:20 },
  scrollContent: { padding: 20 },
  profileSection: {
    alignItems: "center",
    marginBottom: 30,
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
  },
  role: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 4,
  },
  infoSection: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  label: {
    fontWeight: "600",
    color: "#374151",
  },
  value: {
    color: "#6b7280",
  },
});
