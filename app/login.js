import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, TextInput, View } from "react-native";
import { apiFetch } from "../utils/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const logon = () =>{
    router.replace("/register")
  }

  const login = async () => {
    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();

    if (res.ok) {
      router.push("/dashboard");
    } else {
      Alert.alert("Login failed", data.error || "Invalid credentials");
    }
  };

  return (
    <>
    <View style={{ flex: 1, justifyContent: "center", padding: 16 }}>
      <TextInput placeholder="Username" onChangeText={setUsername} style={{ borderBottomWidth: 1, marginBottom: 12 }} />
      <TextInput placeholder="Password" secureTextEntry onChangeText={setPassword} style={{ borderBottomWidth: 1, marginBottom: 12 }} />
      <Button title="Login" onPress={login} />
    </View>

    <View style={{ flex: 1, justifyContent: "center", padding: 16 }}>
      <Button title="Login" onPress={logon} />
    </View>
    </>
  );
}
