import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

import AppFooter from "../components/AppFooter"; // Adjust the path as needed

const quickActions = [
  { label: "All Batches", bgColor: "#fde2e4", route: "/batches/home" },
  { label: "Recent Learning", bgColor: "#e0e7ff", route: "/recent" },
  { label: "My Doubts", bgColor: "#fff7ed", route: "/doubts" },
  { label: "My Downloads", bgColor: "#f0f9ff", route: "/downloads" },
];

const sidebarLinks = [
  { label: "Dashboard", route: "/" },
  { label: "Batches", route: "/batches/home" },
  { label: "Classes", route: "/classes" },
  { label: "Profile", route: "/profile" },
  { label: "Settings", route: "/settings" },
];

const screenWidth = Dimensions.get("window").width;

export default function Dashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarAnim = React.useRef(new Animated.Value(-screenWidth * 0.75)).current;

  const toggleSidebar = () => {
    if (sidebarOpen) {
      Animated.timing(sidebarAnim, {
        toValue: -screenWidth * 0.75,
        duration: 250,
        useNativeDriver: true,
      }).start(() => setSidebarOpen(false));
    } else {
      setSidebarOpen(true);
      Animated.timing(sidebarAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleLinkPress = (route) => {
    toggleSidebar();
    router.push(route);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <Pressable style={styles.overlay} onPress={toggleSidebar} />
      )}

      {/* Sidebar */}
      <Animated.View
        style={[styles.sidebar, { transform: [{ translateX: sidebarAnim }] }]}
      >

        <View style={{ height:60,borderColor:'blue',borderWidth:1,borderRadius:5,alignContent:"center",alignItems:"center",justifyContent:"center" }}>
           <Text>
            <TouchableOpacity
            onPress={() => handleLinkPress("/profile")}
            style={styles.sidebarLink}
          >
             <Text style={styles.sidebarLinkText}>My Profile</Text>
          </TouchableOpacity></Text>
        </View>

        <Text style={styles.sidebarTitle}>Menu</Text>
        {sidebarLinks.map((link, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => handleLinkPress(link.route)}
            style={styles.sidebarLink}
          >
             <Text style={styles.sidebarLinkText}>{link.label}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      <ScrollView>

        {/* Header with Hamburger */}
        <View style={styles.header}>
          <TouchableOpacity onPress={toggleSidebar} style={styles.hamburger}>
            <View style={styles.bar} />
            <View style={styles.bar} />
            <View style={styles.bar} />
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Garud Classes</Text>
          </View>
         </View>

        <View style={styles.classBox}>
          <Text style={styles.noClass}>No Class scheduled!</Text>
          <TouchableOpacity onPress={() => router.push("/classes")}>
            <Text style={styles.link}>View All Classes →</Text>
          </TouchableOpacity>
        </View>

        {/* Continue Watching */}
        <View style={styles.continueCard}>
          <Text style={styles.continueTitle}>Diode Circuits 03: Models of Diode</Text>
          <TouchableOpacity onPress={() => router.push("/video/diode")}>
            <Text style={styles.continueLink}>Continue Watching →</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Access */}
        <View style={styles.quickSection}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.quickItem, { backgroundColor: action.bgColor }]}
                onPress={() => router.push(action.route)}
              >
                <Text style={styles.quickText}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            📢 New Batch starting soon! Enroll now for early bird discounts.
          </Text>
        </View>
      </ScrollView>

      <View style={{ flex: 1, paddingBottom:30 }}>
        <AppFooter/>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop:30,
    marginBottom:15,
    backgroundColor: "#fff",
    elevation: 3,
    marginBottom: 8,
  },
  hamburger: {
    padding: 10,
    marginRight: 10,
    justifyContent: "center",
  },

  bar: {
    width: 20,
    height: 2,
    backgroundColor: "#333",
    marginVertical: 3,
    borderRadius: 2,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 2,
  },
  subText: {
    fontSize: 16,
    color: "#6b7280",
  },
  classBox: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  noClass: {
    fontSize: 15,
    color: "#4b5563",
    marginBottom: 8,
  },
  link: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "600",
  },
  continueCard: {
    backgroundColor: "#fff7ed",
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  continueTitle: {
    fontWeight: "600",
    fontSize: 16,
    marginBottom: 6,
  },
  continueLink: {
    color: "#ef4444",
    fontWeight: "600",
  },
  quickSection: { paddingHorizontal: 20, marginTop: 10 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickItem: {
    width: "48%",
    padding: 20,
    borderRadius: 10,
    marginBottom: 10,
  },
  quickText: {
    fontWeight: "600",
    color: "#1f2937",
    fontSize: 15,
  },
  banner: {
    backgroundColor: "#fef3c7",
    padding: 15,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 8,
  },
  bannerText: {
    color: "#92400e",
    fontWeight: "600",
    textAlign: "center",
  },

  // Sidebar
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: screenWidth * 0.70,
    backgroundColor: "#ffff",
    paddingTop: 50,
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 1000,
  },
  sidebarTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },
  sidebarLink: {
    paddingVertical: 15,
    borderBottomColor: "#e5e7eb",
    borderBottomWidth: 1,
  },
  sidebarLinkText: {
    fontSize: 18,
    color: "#111",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 999,
  },
});
