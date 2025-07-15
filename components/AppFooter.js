import { useRouter, usePathname } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function AppFooter() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { label: "Home", icon: "home-outline", activeIcon: "home", path: "/dashboard" },
    { label: "Batches", icon: "albums-outline", activeIcon: "albums", path: "/batches/home" },
    { label: "QOTD", icon: "help-circle-outline", activeIcon: "help-circle", path: "/questions" },
    { label: "Leaderboard", icon: "trophy-outline", activeIcon: "trophy", path: "/leaderboard" },
    { label: "Profile", icon: "person-outline", activeIcon: "person", path: "/profile" },
  ];

  return (
    <View style={styles.footer}>
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.path);
        return (
          <TouchableOpacity
            key={tab.path}
            onPress={() => router.push(tab.path)}
            style={styles.navItem}
          >
            <Ionicons
              name={isActive ? tab.activeIcon : tab.icon}
              size={22}
              color={isActive ? "#6b28ad" : "#666"}
            />
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 60,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 10,
    color: "#666",
    marginTop: 2,
  },
  activeLabel: {
    color: "#6b28ad",
    fontWeight: "600",
  },
});
