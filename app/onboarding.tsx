import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

interface Slide {
  id: string;
  title: string;
  description: string;
  illustration: any;
  color: string;
}

const slides: Slide[] = [
  {
    id: '1',
    title: 'Keşfetmeye Başla',
    description: 'Çocuğunuzun yaşına özel hazırlanmış dünyalarla tanışın.',
    illustration: require('../assets/peekylogo.png'),
    color: '#7000FF',
  },
  {
    id: '2',
    title: 'Birlikte Öğrenin',
    description: 'Eğitici oyunlar ve interaktif aktivitelerle gelişimi destekleyin.',
    illustration: require('../assets/peekylogo.png'),
    color: '#FF0080',
  },
  {
    id: '3',
    title: 'Gelişimi İzleyin',
    description: 'Başarıları takip edin ve beraber kutlayın!',
    illustration: require('../assets/peekylogo.png'),
    color: '#FF9500',
  },
];

const SlideItem = ({ item, isVisible }: { item: Slide; isVisible: boolean }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for the background circle
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      slideAnim.setValue(20);
      opacityAnim.setValue(0);
    }
  }, [isVisible]);

  return (
    <View style={styles.slide}>
      <View style={styles.illustrationContainer}>
        {/* Animated background circles */}
        <Animated.View
          style={[
            styles.circle,
            {
              backgroundColor: item.color,
              opacity: 0.1,
              transform: [{ scale: pulseAnim }]
            }
          ]}
        />
        <Animated.View
          style={[
            styles.circleSmall,
            {
              backgroundColor: item.color,
              opacity: 0.15,
              transform: [{ scale: Animated.add(pulseAnim, -0.1) }]
            }
          ]}
        />

        <View style={styles.imageWrapper}>
          <Image source={item.illustration} style={styles.image} resizeMode="contain" />
        </View>
      </View>

      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: opacityAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Text style={[styles.title, { color: item.color }]}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </Animated.View>
    </View>
  );
};

const OnboardingScreen = () => {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.push('/multi-step-onboarding');
    }
  };

  const handleSkip = () => {
    router.push('/multi-step-onboarding');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleSkip}>
            <Text style={styles.skipText}>Atla</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={slides}
          renderItem={({ item, index }) => <SlideItem item={item} isVisible={currentIndex === index} />}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: false,
          })}
          scrollEventThrottle={32}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />

        <View style={styles.footer}>
          <View style={styles.paginator}>
            {slides.map((_, i) => {
              const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
              const dotWidth = scrollX.interpolate({
                inputRange,
                outputRange: [10, 24, 10],
                extrapolate: 'clamp',
              });
              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.3, 1, 0.3],
                extrapolate: 'clamp',
              });
              return (
                <Animated.View
                  key={i.toString()}
                  style={[
                    styles.dot,
                    { width: dotWidth, opacity, backgroundColor: slides[currentIndex].color },
                  ]}
                />
              );
            })}
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: slides[currentIndex].color }]}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {currentIndex === slides.length - 1 ? 'Hadi Başlayalım!' : 'Devam Et'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    height: 60,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },
  slide: {
    width,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  illustrationContainer: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  circle: {
    position: 'absolute',
    width: width * 0.75,
    height: width * 0.75,
    borderRadius: (width * 0.75) / 2,
  },
  circleSmall: {
    position: 'absolute',
    width: width * 0.55,
    height: width * 0.55,
    borderRadius: (width * 0.55) / 2,
  },
  imageWrapper: {
    width: width * 0.5,
    height: width * 0.5,
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  image: {
    width: '80%',
    height: '80%',
  },
  textContainer: {
    flex: 0.4,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: -1,
  },
  description: {
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 40,
    paddingBottom: 40,
  },
  paginator: {
    flexDirection: 'row',
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  button: {
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});

export default OnboardingScreen;
