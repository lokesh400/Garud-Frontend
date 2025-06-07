import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Text, View } from "react-native";
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
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      {loading ? <Text>Checking session...</Text> : null}
    </View>
  );
}
