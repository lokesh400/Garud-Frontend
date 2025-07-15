import { useRouter } from "expo-router";
import React, { useState, useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
  StatusBar,
  Platform,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import AppFooter from "../components/AppFooter";
import { Logout } from "../components/Logout";
import { apiFetch } from "../utils/api";
import BatchCarousel from "../components/BatchCarousel";

const quickActions = [
  { label: "My Batches", icon: "layers", bgColor: "#6366f1", route: "/batches/myBatches" },
  { label: "Recent Learning", icon: "history", bgColor: "#10b981", route: "/" },
  { label: "My Doubts", icon: "help-circle", bgColor: "#f59e0b", route: "/" },
  { label: "My Downloads", icon: "download", bgColor: "#3b82f6", route: "/batches/myDownloads" },
];

const sidebarLinks = [
  { label: "Dashboard", icon: "home", route: "/" },
  { label: "Batches", icon: "layers", route: "/batches/home" },
  { label: "Classes", icon: "video", route: "/" },
  { label: "Profile", icon: "user", route: "/profile" },
  { label: "Settings", icon: "settings", route: "/" },
];

const screenWidth = Dimensions.get("window").width;

export default function Dashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarAnim = useRef(new Animated.Value(-screenWidth * 0.75)).current;

  const [featuredBatches, setFeaturedBatches] = useState([]);
  const [loadingbatch, setLoadingbatch] = useState(true);

  useEffect(() => {
    const fetchFeaturedBatches = async () => {
      try {
        const res = await apiFetch("/api/batches/find/trending");
        if (!res.ok) throw new Error("Failed to fetch featured batches");
        setFeaturedBatches(await res.json());
      } catch (err) {
        console.error("Error fetching featured batches:", err);
      } finally {
        setLoadingbatch(false);
      }
    };
    fetchFeaturedBatches();
  }, []);

  const handleLogoutSuccess = () => router.replace("/login");

  const toggleSidebar = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

  const go = (route) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleSidebar();
    router.push(route);
  };

  return (
    <SafeAreaView style={[styles.safeArea]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {sidebarOpen && <Pressable style={styles.overlay} onPress={toggleSidebar} />}

      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, { transform: [{ translateX: sidebarAnim }] }]}>
        <View style={styles.profileCard}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={32} color="#6366f1" />
          </View>
          <TouchableOpacity onPress={() => go("/profile")} style={styles.profileLink}>
            <Text style={styles.profileLinkText}>View Profile</Text>
            <Feather name="chevron-right" size={18} color="#6366f1" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sidebarTitle}>Menu</Text>
        {sidebarLinks.map((l, i) => (
          <TouchableOpacity key={i} onPress={() => go(l.route)} style={styles.sidebarLink}>
            <Ionicons name={l.icon} size={20} color="#64748b" />
            <Text style={styles.sidebarLinkText}>{l.label}</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.logoutContainer}>
          <Logout onSuccess={handleLogoutSuccess} />
        </View>
      </Animated.View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleSidebar} style={styles.hamburger}>
          <Feather name="menu" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.title}>Garud Classes</Text>
      </View>

      {/* Main Scrollable Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      >
        <ImageBackground
          source={require("../assets/images/banner.png")}
          style={styles.bannerImage}
          imageStyle={{ borderRadius: 12 }}
        />

        <View style={styles.classBox}>
          <View style={styles.classHeader}>
            <Ionicons name="time-outline" size={20} color="#64748b" />
            <Text style={styles.classTitle}>Today's Class</Text>
          </View>
          <Text style={styles.noClass}>No class scheduled for today</Text>
          <TouchableOpacity style={styles.linkButton} onPress={() => router.push("/classes")}>
            <Text style={styles.linkButtonText}>View All Classes</Text>
            <Feather name="chevron-right" size={16} color="#6366f1" />
          </TouchableOpacity>
        </View>

        <View style={styles.quickSection}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickGrid}>
            {quickActions.map((a, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.quickItem, { backgroundColor: a.bgColor }]}
                onPress={() => router.push(a.route)}
              >
                <View style={styles.quickIcon}>
                  <Feather name={a.icon} size={24} color="#fff" />
                </View>
                <Text style={styles.quickText}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <BatchCarousel batches={featuredBatches} />

        <View style={styles.notice}>
          <Ionicons name="megaphone" size={20} color="#92400e" style={{ marginRight: 10 }} />
          <Text style={styles.noticeText}>
            New Batch starting soon! Enroll now for early bird discounts.
          </Text>
        </View>

        <View style={{ height: 10 }} />
      </ScrollView>

      {/* Footer */}
      <View style={{ paddingBottom: insets.bottom }}>
        <AppFooter />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 20,
    // paddingTop: 18,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    backgroundColor: "#fff",
  },
  hamburger: { marginRight: 15 },
  title: { fontSize: 22, fontWeight: "700", color: "#1e293b" },
  content: { flex: 1 },
  bannerImage: {
    height: 180,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
  classBox: {
    backgroundColor: "#fff",
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  classHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  classTitle: { marginLeft: 8, fontSize: 16, fontWeight: "600", color: "#1e293b" },
  noClass: { fontSize: 15, color: "#64748b", marginBottom: 15 },
  linkButton: { flexDirection: "row", alignItems: "center" },
  linkButtonText: { fontSize: 14, color: "#6366f1", fontWeight: "600", marginRight: 4 },
  quickSection: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#1e293b", marginBottom: 15 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  quickItem: {
    width: "48%",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  quickText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  notice: {
    backgroundColor: "#fef3c7",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 12,
  },
  noticeText: { color: "#92400e", fontWeight: "500", flex: 1 },
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: screenWidth * 0.75,
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingHorizontal: 20,
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
    zIndex: 1000,
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e0e7ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  profileLink: { flexDirection: "row", alignItems: "center" },
  profileLinkText: { fontSize: 16, fontWeight: "500", color: "#6366f1", marginRight: 5 },
  sidebarTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 15,
  },
  sidebarLink: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  sidebarLinkText: { fontSize: 16, marginLeft: 15, color: "#1e293b" },
  logoutContainer: { position: "absolute", bottom: 40, left: 20, right: 20 },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 999,
  },
});
