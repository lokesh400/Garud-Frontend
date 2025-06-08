import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Image, Dimensions, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const SPACING = 10;
const SIDE_CARD_WIDTH = (width - CARD_WIDTH - SPACING * 2) / 2;

const BatchCarousel = ({ batches }) => {
  const router = useRouter();
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  );

  const handleViewAll = () => {
    router.push('/batches/allBatches');
  };

  const renderItem = ({ item, index }) => {
    const inputRange = [
      (index - 2) * CARD_WIDTH,
      (index - 1) * CARD_WIDTH,
      index * CARD_WIDTH,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.5, 1, 0.5],
    });

    return (
      <Animated.View
        style={[
          styles.card,
          {
            transform: [{ scale }],
            opacity,
            width: CARD_WIDTH,
          },
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push(`/batches/${item._id}`)}
        >
          <Image
            source={{ uri: item.thumbnail }}
            style={styles.cardImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradient}
          />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.cardClass}>{item.class}</Text>
            <Text style={styles.cardTests}>{item.tests.length} Tests</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={batches}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + SPACING}
        decelerationRate="fast"
        contentContainerStyle={styles.flatListContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(
            e.nativeEvent.contentOffset.x / (CARD_WIDTH + SPACING)
          );
          setCurrentIndex(index);
        }}
      />

      <TouchableOpacity
        style={styles.viewAllButton}
        onPress={handleViewAll}
      >
        <Text style={styles.viewAllText}>View All Batches</Text>
        <MaterialIcons name="chevron-right" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  flatListContent: {
    paddingHorizontal: SIDE_CARD_WIDTH,
  },
  card: {
    marginHorizontal: SPACING,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    height: 200,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardClass: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 5,
  },
  cardTests: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 20,
  },
  viewAllText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 5,
  },
});

export default BatchCarousel;