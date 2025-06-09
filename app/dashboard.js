import { useRouter } from "expo-router";
import React, { useState,useEffect } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ImageBackground,
  StatusBar,
  Platform,
  KeyboardAvoidingView
} from "react-native";
import { MaterialIcons, Ionicons, FontAwesome, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AppFooter from "../components/AppFooter";
import { Logout } from '../components/Logout';

import { apiFetch } from "../utils/api";

import { ActivityIndicator } from 'react-native';
import BatchCarousel from '../components/BatchCarousel';

const quickActions = [
  { label: "All Batches", icon: "layers", bgColor: "#6366f1", route: "/batches/home" },
  { label: "Recent Learning", icon: "history", bgColor: "#10b981", route: "/" },
  { label: "My Doubts", icon: "help-circle", bgColor: "#f59e0b", route: "/" },
  { label: "My Downloads", icon: "download", bgColor: "#3b82f6", route: "/" },
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarAnim = React.useRef(new Animated.Value(-screenWidth * 0.75)).current;

  const [featuredBatches, setFeaturedBatches] = useState([]);
  const [loadingbatch, setLoadingbatch] = useState(true);

useEffect(() => {
  const fetchFeaturedBatches = async () => {
    try {
      const response = await apiFetch('/api/batches/find/trending');
      if (!response.ok) {
        throw new Error('Failed to fetch featured batches');
      }
      const data = await response.json();
      setFeaturedBatches(data);
    } catch (error) {
      console.error('Error fetching featured batches:', error);
    } finally {
      setLoadingbatch(false);
    }
  };

  fetchFeaturedBatches();
}, []);


  const handleLogoutSuccess = () => {
    router.replace('/login');
  };

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

  const handleLinkPress = (route) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleSidebar();
    router.push(route);
  };

  return (
    <>
      <View style={styles.container}>
          <StatusBar barStyle="dark-content" />
          
          {/* Custom Header */}
          <SafeAreaView style={styles.headerSafeArea}>
            
          </SafeAreaView>
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <Pressable style={styles.overlay} onPress={toggleSidebar} />
      )}

      {/* Sidebar */}
      <Animated.View
        style={[styles.sidebar, { transform: [{ translateX: sidebarAnim }] }]}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={32} color="#6366f1" />
          </View>
          <TouchableOpacity
            onPress={() => handleLinkPress("/profile")}
            style={styles.profileLink}
          >
            <Text style={styles.profileLinkText}>View Profile</Text>
            <Feather name="chevron-right" size={18} color="#6366f1" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sidebarTitle}>Menu</Text>
        {sidebarLinks.map((link, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => handleLinkPress(link.route)}
            style={styles.sidebarLink}
          >
            <Ionicons name={link.icon} size={20} color="#64748b" />
            <Text style={styles.sidebarLinkText}>{link.label}</Text>
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
          
          <View style={styles.headerContent}>
            <Text style={styles.title}>Garud Classes</Text>
          </View>
        </View>

      <ScrollView style={styles.contentContainer}>

        <ImageBackground 
          source={require('../assets/images/banner.png')} // Add your own image
          style={styles.continueCard}
          imageStyle={styles.continueCardImage}
        >
        </ImageBackground>

        {/* Class Status Card */}
        <View style={styles.classBox}>
          <View style={styles.classHeader}>
            <Ionicons name="time-outline" size={20} color="#64748b" />
            <Text style={styles.classTitle}>Today's Class</Text>
          </View>
          <Text style={styles.noClass}>No class scheduled for today</Text>
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => router.push("/classes")}
          >
            <Text style={styles.linkButtonText}>View All Classes</Text>
            <Feather name="chevron-right" size={16} color="#6366f1" />
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
                <View style={styles.quickIcon}>
                  <Feather name={action.icon} size={24} color="#ffff" />
                </View>
                <Text style={styles.quickText}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ flex: 1 }}>
         <BatchCarousel batches={featuredBatches} />
        </View>

        {/* Banner */}
        <View style={styles.banner}>
          <View style={styles.bannerIcon}>
            <Ionicons name="megaphone" size={20} color="#92400e" />
          </View>
          <Text style={styles.bannerText}>
            New Batch starting soon! Enroll now for early bird discounts.
          </Text>
        </View>

        <View style={{marginTop:10}} ></View>

      </ScrollView>
    </View>
    <AppFooter/>
    </>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#ffff", 
    paddingTop:20,
    marginBottom:60,
  },
  contentContainer: {
    paddingBottom: 80
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 20,
    paddingTop: 18,
    paddingBottom:15,
    backgroundColor: "#ffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0"
  },
  hamburger: {
    marginRight: 15
  },
  headerContent: {
    flex: 1
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1e293b"
  },
  subText: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2
  },
  classBox: {
    backgroundColor: "#fff",
    padding: 20,
    margin: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2
  },
  classHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10
  },
  classTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginLeft: 8
  },
  noClass: {
    fontSize: 15,
    color: "#64748b",
    marginBottom: 15
  },
  linkButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start"
  },
  linkButtonText: {
    fontSize: 14,
    color: "#6366f1",
    fontWeight: "600",
    marginRight: 4
  },
  continueCard: {
    height: 180,
    marginHorizontal: 20,
    marginTop:20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden"
  },
  continueCardImage: {
    borderRadius: 12,
  },
  continueContent: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.4)"
  },
  continueBadge: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 8,
    letterSpacing: 1
  },
  continueTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#6366f1",
    alignSelf: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20
  },
  continueButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 8
  },
  quickSection: { 
    paddingHorizontal: 20,
    marginBottom: 20
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 15
  },
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },
  quickItem: {
    width: "48%",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10
  },
  quickText: {
    fontWeight: "600",
    color: "#fff",
    fontSize: 15
  },
  banner: {
    backgroundColor: "#fef3c7",
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center"
  },
  bannerIcon: {
    marginRight: 10
  },
  bannerText: {
    color: "#92400e",
    fontWeight: "500",
    flex: 1
  },
  // Sidebar styles
  sidebar: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: screenWidth * 0.75,
    backgroundColor: "#fff",
    paddingTop: 60,
    paddingHorizontal: 20,
    zIndex: 1000,
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0"
  },
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0"
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e0e7ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15
  },
  profileLink: {
    flexDirection: "row",
    alignItems: "center"
  },
  profileLinkText: {
    fontSize: 16,
    color: "#6366f1",
    fontWeight: "500",
    marginRight: 5
  },
  sidebarTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 15,
    textTransform: "uppercase",
    letterSpacing: 1
  },
  sidebarLink: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9"
  },
  sidebarLinkText: {
    fontSize: 16,
    color: "#1e293b",
    marginLeft: 15
  },
  logoutContainer: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 999
  }
});