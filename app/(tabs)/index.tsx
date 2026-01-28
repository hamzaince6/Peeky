import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../utils/authContext';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

interface GameCard {
  id: string;
  title: string;
  emoji: string;
  type: 'questions' | 'drawing' | 'logic' | 'memory';
  status: 'available' | 'coming-soon';
  colors: [string, string];
  rotate: string;
}

interface ExplorerCard {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  colors: [string, string];
}

const GAMES: GameCard[] = [
  {
    id: '1',
    title: 'Soru Dünyası',
    emoji: '❓',
    type: 'questions',
    status: 'available',
    colors: ['#7000FF', '#9D50FF'],
    rotate: '-15deg',
  },
  {
    id: '2',
    title: 'Çizim Atölyesi',
    emoji: '🎨',
    type: 'drawing',
    status: 'coming-soon',
    colors: ['#FF0080', '#FF5B9D'],
    rotate: '10deg',
  },
  {
    id: '3',
    title: 'Mantık Köyü',
    emoji: '🧩',
    type: 'logic',
    status: 'coming-soon',
    colors: ['#FF9500', '#FFB74D'],
    rotate: '-5deg',
  },
  {
    id: '4',
    title: 'Hafıza Bahçesi',
    emoji: '🧠',
    type: 'memory',
    status: 'coming-soon',
    colors: ['#00C7BE', '#59E1D4'],
    rotate: '12deg',
  },
];

const EXPLORERS: ExplorerCard[] = [
  {
    id: 'e1',
    title: 'Profilini Geliştir!',
    subtitle: 'Görevleri tamamla, ödülleri kap.',
    emoji: '🏆',
    colors: ['#0F172A', '#1E293B'],
  },
  {
    id: 'e2',
    title: 'Günlük Yarışma',
    subtitle: 'Bugün en iyi skoru kim yapacak?',
    emoji: '⚡',
    colors: ['#4F46E5', '#6366F1'],
  },
  {
    id: 'e3',
    title: 'Yıldızları Topla',
    subtitle: '100 yıldıza ulaştığında sürprize hazır ol!',
    emoji: '⭐',
    colors: ['#EA580C', '#F97316'],
  },
];

const GameHubScreen = () => {
  const router = useRouter();
  const { profile, ageGroup } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-20)).current;

  const nickname = profile?.nickname || 'Oyuncu';

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(headerSlide, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleGameSelect = (game: GameCard) => {
    console.log('Game selected:', game.title, 'Status:', game.status, 'Type:', game.type);

    if (game.status === 'available' && game.type === 'questions') {
      // Eğer yaş grubu seçilmemişse önce yaş seçimine yönlendir
      if (!ageGroup && !profile?.age_group) {
        console.log('No age group selected, redirecting to age-selection');
        router.push('/age-selection');
        return;
      }

      const selectedAgeGroup = ageGroup || profile?.age_group || 'EARLY_PRIMARY';
      console.log('Navigating to question-game with ageGroup:', selectedAgeGroup);
      router.push(`/question-game?ageGroup=${selectedAgeGroup}`);
    } else {
      console.log('Game not available or wrong type');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Unified Premium Profile Box */}
        <Animated.View
          style={[styles.headerWrapper, { opacity: fadeAnim, transform: [{ translateY: headerSlide }] }]}
        >
          <TouchableOpacity
            style={styles.profileBox}
            activeOpacity={0.9}
            onPress={() => router.push('/age-selection')}
          >
            <View style={styles.profileContent}>
              <View style={styles.profileAvatarBox}>
                <Text style={styles.profileAvatarEmoji}>🎮</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileGreeting}>Hoş Geldin 👋</Text>
                <Text style={styles.profileName} numberOfLines={1}>
                  {nickname}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Main Games Grid */}
          <View style={styles.gameGrid}>
            {GAMES.map((game) => (
              <Animated.View
                key={game.id}
                style={[
                  styles.gameWrapper,
                  {
                    opacity: fadeAnim,
                  },
                ]}
              >
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => handleGameSelect(game)}
                  disabled={game.status === 'coming-soon'}
                  style={styles.touchable}
                >
                  <LinearGradient
                    colors={game.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cardGradient}
                  >
                    <View style={[styles.decorativeCircle, { transform: [{ rotate: game.rotate }] }]}>
                      <Text style={styles.cardEmoji}>{game.emoji}</Text>
                    </View>

                    <View style={styles.infoContainer}>
                      <Text style={styles.gameTitle}>{game.title}</Text>
                      <View style={styles.playBadge}>
                        <Text style={styles.playText}>
                          {game.status === 'coming-soon' ? '🔒 Yakında' : 'Oyna 🚀'}
                        </Text>
                      </View>
                    </View>

                    {game.status === 'coming-soon' && <View style={styles.overlay} />}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          {/* Explorer Section with Slider */}
          <View style={styles.explorerSection}>
            <Text style={styles.sectionTitle}>Yeni Keşifler</Text>
            <FlatList
              data={EXPLORERS}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              snapToInterval={width * 0.75 + 15}
              decelerationRate="fast"
              contentContainerStyle={styles.explorerList}
              renderItem={({ item }) => (
                <TouchableOpacity activeOpacity={0.9} style={styles.explorerCard}>
                  <LinearGradient colors={item.colors} style={styles.explorerInner}>
                    <View style={styles.explorerTextContainer}>
                      <Text style={styles.explorerTitle}>{item.title}</Text>
                      <Text style={styles.explorerSubtitle} numberOfLines={2}>
                        {item.subtitle}
                      </Text>
                    </View>
                    <Text style={styles.explorerEmoji}>{item.emoji}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  safeArea: {
    flex: 1,
  },
  headerWrapper: {
    paddingHorizontal: 25,
    paddingTop: 10,
    paddingBottom: 20,
  },
  profileBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#7000FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileAvatarBox: {
    width: 60,
    height: 60,
    backgroundColor: '#F3E8FF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  profileAvatarEmoji: {
    fontSize: 32,
  },
  profileInfo: {
    flex: 1,
  },
  profileGreeting: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginTop: 2,
  },
  scrollContent: {
    paddingBottom: 110, // Space for tab bar
  },
  gameGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 25,
  },
  gameWrapper: {
    width: '48.5%',
    aspectRatio: 0.85,
    marginBottom: 15,
  },
  touchable: {
    flex: 1,
  },
  cardGradient: {
    flex: 1,
    borderRadius: 32,
    padding: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 10,
  },
  decorativeCircle: {
    position: 'absolute',
    top: -10,
    right: -20,
    width: 140,
    height: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 70,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 10,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  gameTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  playBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  playText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  explorerSection: {
    marginTop: 25,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 15,
    paddingHorizontal: 25,
  },
  explorerList: {
    paddingHorizontal: 25,
    paddingBottom: 20,
  },
  explorerCard: {
    width: width * 0.75,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  explorerInner: {
    padding: 20,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 120,
  },
  explorerTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  explorerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  explorerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
    lineHeight: 18,
  },
  explorerEmoji: {
    fontSize: 40,
  },
});

export default GameHubScreen;

