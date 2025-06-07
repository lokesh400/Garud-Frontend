import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AppFooter() {
  const router = useRouter();

  return (
    <View style={styles.footer}>
      <TouchableOpacity onPress={() => router.push("/home")} style={styles.navItem}>
        <Image source={require("../assets/images/icon.png")} style={styles.icon} />
        <Text style={styles.label}>Home</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/batches")} style={styles.navItem}>
        <Image source={require("../assets/images/icon.png")} style={styles.icon} />
        <Text style={styles.label}>Batches</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/profile")} style={styles.navItem}>
        <Image source={require("../assets/images/icon.png")} style={styles.icon} />
        <Text style={styles.label}>Profile</Text>
      </TouchableOpacity>
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
    elevation: 10,
  },
  navItem: {
    alignItems: "center",
  },
  icon: {
    width: 24,
    height: 24,
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    color: "#1f2937",
  },
});
