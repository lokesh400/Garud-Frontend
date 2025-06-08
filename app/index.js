import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View, Image, StyleSheet } from "react-native";
import { apiFetch } from "../utils/api";

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const res = await apiFetch("/auth/me");
      if (res.ok) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/images/icon.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
      </Image>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:"#ffff",
  },
  backgroundImage: {
    width: 300,
    height: 300,
    position: "absolute",
    top: "50%",                  
    left: "50%",                  
    transform: [
      { translateX: -150 }, 
      { translateY: -150 },   
    ],
  },
});