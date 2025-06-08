import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, TextInput, View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { apiFetch } from "../utils/api";
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const goBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace('/login');
  };

  const register = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (!username || !password) {
      Alert.alert("Missing fields", "Please enter both username and password");
      return;
    }

    setIsLoading(true);
    
    try {
      const res = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Success", "User registered successfully");
        router.replace("/login");
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Error", data.error || "Registration failed");
      }
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Something went wrong during registration");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Header with back button */}
      <Animated.View 
        style={styles.header}
        entering={FadeInDown.duration(500)}
      >
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Create Account</Text>
      </Animated.View>

      {/* Form */}
      <View style={styles.formContainer}>
        <Animated.View 
          style={styles.inputContainer}
          entering={FadeInUp.duration(600).delay(200)}
        >
          <Ionicons name="person-outline" size={20} color="#777" style={styles.inputIcon} />
          <TextInput
            placeholder="Username"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            autoCapitalize="none"
          />
        </Animated.View>

        <Animated.View 
          style={styles.inputContainer}
          entering={FadeInUp.duration(600).delay(300)}
        >
          <Ionicons name="lock-closed-outline" size={20} color="#777" style={styles.inputIcon} />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(600).delay(500)}>
          <TouchableOpacity 
            style={styles.registerButton}
            onPress={register}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <Text style={styles.registerButtonText}>Creating Account...</Text>
            ) : (
              <>
                <Text style={styles.registerButtonText}>Sign Up</Text>
                <FontAwesome name="user-plus" size={16} color="#fff" style={styles.registerIcon} />
              </>
            )}
          </TouchableOpacity>
        </Animated.View>

        <Animated.View 
          style={styles.loginContainer}
          entering={FadeInUp.duration(600).delay(600)}
        >
          <Text style={styles.loginText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.replace("/login")}>
            <Text style={styles.loginLink}>Login</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
  },
  backButton: {
    marginRight: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  formContainer: {
    paddingHorizontal: 25,
    paddingTop: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  roleText: {
    fontSize: 16,
    color: '#555',
    marginRight: 15,
  },
  roleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
  },
  roleButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginRight: 8,
  },
  roleIcon: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
    padding: 2,
  },
  registerButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    borderRadius: 10,
    paddingVertical: 15,
    marginBottom: 20,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  registerIcon: {
    marginLeft: 10,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  loginText: {
    color: '#666',
    marginRight: 5,
  },
  loginLink: {
    color: '#6366f1',
    fontWeight: 'bold',
  },
});