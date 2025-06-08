import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, TextInput, View, Text, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Dimensions } from "react-native";
import { apiFetch } from "../utils/api";
import Animated, { FadeIn, FadeInDown, FadeInUp, FadeOut, interpolate, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

const { width, height } = Dimensions.get('window');

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const router = useRouter();

  // Animation values
  const buttonScale = useSharedValue(1);
  const formPosition = useSharedValue(0);

  const handleRegister = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.replace("/register");
  };

  const togglePasswordVisibility = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPasswordVisible(!isPasswordVisible);
  };

  const login = async () => {
    // Button press animation
    buttonScale.value = withSpring(0.95);
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    
    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (res.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Success animation
        formPosition.value = withTiming(-height, { duration: 800 });
        setTimeout(() => router.push("/dashboard"), 600);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Login failed", data.error || "Invalid credentials");
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Network request failed");
    } finally {
      setIsLoading(false);
      buttonScale.value = withSpring(1);
    }
  };

  // Animated styles
  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const formAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: formPosition.value }],
    };
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Background Gradient */}
      <LinearGradient
        colors={['#0f0c29', '#302b63', '#24243e']}
        style={styles.background}
      />

      {/* Floating Particles Animation */}
      <Animated.View style={styles.particlesContainer}>
        {[...Array(15)].map((_, i) => (
          <Animated.View
            key={i}
            style={[
              styles.particle,
              {
                top: Math.random() * height,
                left: Math.random() * width,
                opacity: Math.random() * 0.6 + 0.2,
                transform: [
                  { scale: Math.random() * 0.5 + 0.5 },
                  { rotate: `${Math.random() * 360}deg` }
                ]
              }
            ]}
            entering={FadeIn.delay(i * 100)}
          />
        ))}
      </Animated.View>

      {/* Header */}
      <Animated.View 
        style={styles.header}
        entering={FadeInUp.duration(1000)}
      >
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to your account</Text>
      </Animated.View>

      {/* Form Container */}
      <Animated.View 
        style={[styles.formContainer, formAnimatedStyle]}
        entering={FadeInDown.duration(1000).delay(200)}
      >
        {/* Username Input */}
        <Animated.View 
          style={styles.inputContainer}
          entering={FadeInDown.duration(600).delay(300)}
        >
          <MaterialCommunityIcons 
            name="account-outline" 
            size={24} 
            color="#a1a1a1" 
            style={styles.inputIcon} 
          />
          <TextInput
            placeholder="Username"
            placeholderTextColor="#a1a1a1"
            onChangeText={setUsername}
            style={styles.input}
            autoCapitalize="none"
          />
        </Animated.View>

        {/* Password Input */}
        <Animated.View 
          style={styles.inputContainer}
          entering={FadeInDown.duration(600).delay(400)}
        >
          <MaterialCommunityIcons 
            name="lock-outline" 
            size={24} 
            color="#a1a1a1" 
            style={styles.inputIcon} 
          />
          <TextInput
            placeholder="Password"
            placeholderTextColor="#a1a1a1"
            secureTextEntry={!isPasswordVisible}
            onChangeText={setPassword}
            style={styles.input}
          />
          <TouchableOpacity onPress={togglePasswordVisibility}>
            <Ionicons 
              name={isPasswordVisible ? "eye-off-outline" : "eye-outline"} 
              size={24} 
              color="#a1a1a1" 
            />
          </TouchableOpacity>
        </Animated.View>

        {/* Forgot Password */}
        <Animated.View entering={FadeInDown.duration(600).delay(500)}>
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot password?</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Login Button */}
        <Animated.View entering={FadeInDown.duration(600).delay(600)}>
          <Animated.View style={buttonAnimatedStyle}>
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={login}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {isLoading ? (
                  <Text
                    style={styles.loadingAnimation}
                  > Please Wait </Text>
                ) : (
                  <Text style={styles.buttonText}>LOGIN</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>

        {/* Divider */}
        <Animated.View 
          style={styles.dividerContainer}
          entering={FadeInDown.duration(600).delay(700)}
        >
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </Animated.View>

        {/* Social Login */}
        <Animated.View 
          style={styles.socialContainer}
          entering={FadeInDown.duration(600).delay(800)}
        >
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-google" size={24} color="#DB4437" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-apple" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-facebook" size={24} color="#4267B2" />
          </TouchableOpacity>
        </Animated.View>

        {/* Sign Up Link */}
        <Animated.View 
          style={styles.footer}
          entering={FadeInDown.duration(600).delay(900)}
        >
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={handleRegister}>
            <Text style={styles.registerText}>Sign Up</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  particlesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
    width: 10,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 5,
  },
  header: {
    paddingTop: height * 0.1,
    paddingHorizontal: 30,
    marginBottom: 20,
    alignItems: 'center',
  },
  waveAnimation: {
    width: 150,
    height: 150,
    marginBottom: -30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    fontFamily: 'HelveticaNeue-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    fontFamily: 'HelveticaNeue-Light',
  },
  formContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 30,
    marginTop: 'auto',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -10,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    paddingHorizontal: 20,
    marginBottom: 20,
    height: 60,
  },
  inputIcon: {
    marginRight: 15,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: '#333',
    fontFamily: 'HelveticaNeue',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 25,
  },
  forgotPasswordText: {
    color: '#667eea',
    fontSize: 14,
    fontFamily: 'HelveticaNeue-Medium',
  },
  loginButton: {
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    marginBottom: 25,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'HelveticaNeue-Bold',
    letterSpacing: 1,
  },
  loadingAnimation: {
    width: 50,
    height: 50,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#a1a1a1',
    fontFamily: 'HelveticaNeue-Medium',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 30,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: '#666',
    marginRight: 5,
    fontFamily: 'HelveticaNeue',
  },
  registerText: {
    color: '#667eea',
    fontWeight: 'bold',
    fontFamily: 'HelveticaNeue-Bold',
  },
});