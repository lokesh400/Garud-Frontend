import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { logoutUser } from '../utils/api';

export function Logout({ onSuccess }) {
  const handleLogout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      const { message } = await logoutUser();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Success', message);
      onSuccess(); // Callback to handle post-logout navigation
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <Animated.View 
      entering={FadeIn.duration(500)}
      exiting={FadeOut.duration(300)}
    >
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <MaterialIcons name="logout" size={24} color="#ff4444" />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 68, 68, 0.1)',
    alignSelf: 'flex-end',
    margin: 16
  }
});