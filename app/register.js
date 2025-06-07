import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, Text, TextInput, View } from "react-native";
import { apiFetch } from "../utils/api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); // default role
  const router = useRouter();

  const register = async () => {
    if (!username || !password) {
      Alert.alert("Missing fields", "Please enter both username and password");
      return;
    }

    try {
      const res = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, password, role }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Success", "User registered successfully");
        router.replace("/login"); // go to login screen
      } else {
        Alert.alert("Error", data.error || "Registration failed");
      }
    } catch (err) {
      Alert.alert("Error", "Something went wrong during registration");
      console.error(err);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center" }}>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={{ borderBottomWidth: 1, marginBottom: 16 }}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderBottomWidth: 1, marginBottom: 16 }}
      />
      {/* You can turn this into a dropdown/select in the future */}
      <Text style={{ marginBottom: 8 }}>Role: {role}</Text>

      <Button title="Sign Up" onPress={register} />
    </View>
  );
}
