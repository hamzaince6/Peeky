import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useTheme } from './utils/themeContext';

type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

type MemoryCard = {
  id: string;
  pairId: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
};

type MemoryGameSummary = {
  id: string;
  createdAt: string;
  difficulty: Difficulty;
  gridCols: number;
  gridRows: number;
  moves: number;
  elapsedMs: number;
  completed: boolean;
};

const STORAGE_KEY = 'peeky_memory_garden_history';

const EMOJI_POOL = ['🌸', '🌻', '🌼', '🌱', '🌿', '🍀', '🌷', '🌹', '🍄', '🦋', '🐝', '☀️'];

const difficultyConfig: Record<
  Difficulty,
  {
    label: string;
    rows: number;
    cols: number;
  }
> = {
  EASY: { label: 'Kolay', rows: 3, cols: 4 }, // 12 kart (6 çift)
  MEDIUM: { label: 'Orta', rows: 4, cols: 4 }, // 16 kart (8 çift)
  HARD: { label: 'Zor', rows: 4, cols: 5 }, // 20 kart (10 çift)
};

const generateId = () => `mem_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

const shuffleArray = <T,>(arr: T[]): T[] => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const MemoryGardenScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [history, setHistory] = useState<MemoryGameSummary[]>([]);
  const [screen, setScreen] = useState<'menu' | 'playing' | 'summary'>('menu');

  const [difficulty, setDifficulty] = useState<Difficulty>('EASY');
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [firstCardId, setFirstCardId] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [moves, setMoves] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [lastSummary, setLastSummary] = useState<MemoryGameSummary | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setIsLoading(true);
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) {
          setHistory([]);
          return;
        }
        const parsed: MemoryGameSummary[] = JSON.parse(raw);
        setHistory(parsed);
      } catch (error) {
        console.warn('Failed to load memory garden history', error);
        setHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadHistory();
  }, []);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  const createCardsForDifficulty = (level: Difficulty): MemoryCard[] => {
    const cfg = difficultyConfig[level];
    const total = cfg.rows * cfg.cols;
    const pairs = total / 2;
    const emojis = shuffleArray(EMOJI_POOL).slice(0, pairs);

    let cards: MemoryCard[] = [];
    emojis.forEach((emoji, index) => {
      const pairId = index;
      const cardA: MemoryCard = {
        id: `${pairId}_a`,
        pairId,
        emoji,
        isFlipped: false,
        isMatched: false,
      };
      const cardB: MemoryCard = {
        id: `${pairId}_b`,
        pairId,
        emoji,
        isFlipped: false,
        isMatched: false,
      };
      cards.push(cardA, cardB);
    });

    cards = shuffleArray(cards);
    return cards;
  };

  const startNewGame = (level: Difficulty) => {
    const gameCards = createCardsForDifficulty(level);
    setDifficulty(level);
    setCards(gameCards);
    setFirstCardId(null);
    setIsLocked(false);
    setMoves(0);
    setStartTime(Date.now());
    setElapsedMs(0);
    setLastSummary(null);
    setScreen('playing');
  };

  const handleCardPress = (card: MemoryCard) => {
    if (isLocked || card.isFlipped || card.isMatched) return;

    const nowCards = cards.map((c) =>
      c.id === card.id ? { ...c, isFlipped: true } : c
    );
    setCards(nowCards);

    if (!firstCardId) {
      setFirstCardId(card.id);
      return;
    }

    setIsLocked(true);
    setMoves((m) => m + 1);

    const first = nowCards.find((c) => c.id === firstCardId);
    const second = card;

    if (first && first.pairId === second.pairId) {
      const updated = nowCards.map((c) =>
        c.pairId === first.pairId ? { ...c, isMatched: true } : c
      );
      setTimeout(() => {
        setCards(updated);
        setIsLocked(false);
        setFirstCardId(null);

        const allMatched = updated.every((c) => c.isMatched);
        if (allMatched) {
          finishGame(updated);
        }
      }, 350);
    } else {
      setTimeout(() => {
        const reset = nowCards.map((c) =>
          c.isMatched ? c : { ...c, isFlipped: false }
        );
        setCards(reset);
        setIsLocked(false);
        setFirstCardId(null);
      }, 650);
    }
  };

  const finishGame = async (finalCards: MemoryCard[]) => {
    const end = Date.now();
    const started = startTime ?? end;
    const totalMs = end - started;
    setElapsedMs(totalMs);

    const cfg = difficultyConfig[difficulty];
    const summary: MemoryGameSummary = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      difficulty,
      gridCols: cfg.cols,
      gridRows: cfg.rows,
      moves,
      elapsedMs: totalMs,
      completed: true,
    };

    try {
      const nextHistory = [summary, ...history].slice(0, 50);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
      setHistory(nextHistory);
    } catch (error) {
      console.warn('Failed to save memory garden summary', error);
    }

    setLastSummary(summary);
    setScreen('summary');
  };

  const handleReplaySame = () => {
    startNewGame(difficulty);
  };

  const goToMenu = () => {
    setScreen('menu');
  };

  const prettyTime = (ms: number) => {
    const totalSeconds = Math.round(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    if (m === 0) return `${s} sn`;
    return `${m} dk ${s} sn`;
  };

  const headerSubtitle =
    screen === 'menu'
      ? 'Zorluğu seç ve yeni oyuna başla'
      : screen === 'playing'
      ? 'Eşleşen kartları bulmaya çalış'
      : 'Bahçedeki hafıza çiçeklerin hazır';

  const currentConfig = useMemo(() => difficultyConfig[difficulty], [difficulty]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Hafıza Bahçen hazırlanıyor 🌿</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={handleBack}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Hafıza Bahçesi</Text>
            <Text style={styles.headerSubtitle}>{headerSubtitle}</Text>
          </View>
          <View style={styles.headerRight} />
        </View>

        {screen === 'menu' && (
          <View style={styles.menuContent}>
            <View style={styles.difficultySection}>
              <Text style={styles.sectionTitle}>Zorluk Seçimi</Text>
              <View style={styles.difficultyRow}>
                {(Object.keys(difficultyConfig) as Difficulty[]).map((level) => {
                  const cfg = difficultyConfig[level];
                  const isActive = difficulty === level;
                  return (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.difficultyChip,
                        isActive && styles.difficultyChipActive,
                      ]}
                      onPress={() => setDifficulty(level)}
                    >
                      <Text
                        style={[
                          styles.difficultyChipText,
                          isActive && styles.difficultyChipTextActive,
                        ]}
                      >
                        {cfg.label}
                      </Text>
                      <Text
                        style={[
                          styles.difficultyChipSub,
                          isActive && styles.difficultyChipTextActive,
                        ]}
                      >
                        {cfg.rows}x{cfg.cols}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => startNewGame(difficulty)}
              >
                <Text style={styles.primaryButtonText}>Yeni Oyun Başlat</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.historySection}>
              <Text style={styles.sectionTitle}>Geçmiş Oyunlar</Text>
              {history.length === 0 ? (
                <Text style={styles.historyEmpty}>
                  Henüz oynanmış bir oyun yok. İlk bahçeni şimdi oluştur!
                </Text>
              ) : (
                <FlatList
                  data={history}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.historyList}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.historyCard}
                      onPress={() => startNewGame(item.difficulty)}
                      activeOpacity={0.9}
                    >
                      <View style={styles.historyHeaderRow}>
                        <Text style={styles.historyDifficulty}>
                          {difficultyConfig[item.difficulty].label}
                        </Text>
                        <Text style={styles.historyDate}>
                          {new Date(item.createdAt).toLocaleDateString('tr-TR', {
                            day: '2-digit',
                            month: '2-digit',
                          })}
                        </Text>
                      </View>
                      <Text style={styles.historyGrid}>
                        {item.gridRows}x{item.gridCols} • {item.moves} hamle
                      </Text>
                      <Text style={styles.historyTime}>{prettyTime(item.elapsedMs)}</Text>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          </View>
        )}

        {screen === 'playing' && (
          <View style={styles.playContent}>
            <View style={styles.playHeaderRow}>
              <Text style={styles.playBadge}>
                {difficultyConfig[difficulty].label} • {currentConfig.rows}x{currentConfig.cols}
              </Text>
              <Text style={styles.playMovesText}>{moves} hamle</Text>
            </View>
            <View style={styles.gridContainer}>
              {cards.map((card) => {
                const showFront = card.isFlipped || card.isMatched;
                return (
                  <TouchableOpacity
                    key={card.id}
                    style={[
                      styles.cardBase,
                      showFront && styles.cardBaseFlipped,
                      card.isMatched && styles.cardMatched,
                    ]}
                    activeOpacity={0.9}
                    onPress={() => handleCardPress(card)}
                    disabled={isLocked || card.isMatched}
                  >
                    <View style={styles.cardInner}>
                      {showFront ? (
                        <Text style={styles.cardEmoji}>{card.emoji}</Text>
                      ) : (
                        <View style={styles.cardBackPattern}>
                          <View style={styles.cardBackLeaf} />
                          <View style={[styles.cardBackLeaf, styles.cardBackLeafSmall]} />
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.playActionsRow}>
              <TouchableOpacity style={styles.secondaryButton} onPress={goToMenu}>
                <Text style={styles.secondaryButtonText}>Menüye Dön</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => startNewGame(difficulty)}
              >
                <Text style={styles.secondaryButtonText}>Yeniden Başlat</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {screen === 'summary' && lastSummary && (
          <View style={styles.summaryContent}>
            <Text style={styles.summaryTitle}>Bahçen Tamamlandı! 🌼</Text>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryBadge}>
                {difficultyConfig[lastSummary.difficulty].label} • {lastSummary.gridRows}x
                {lastSummary.gridCols}
              </Text>
              <Text style={styles.summaryMain}>
                {lastSummary.moves} hamlede bitirdin
              </Text>
              <Text style={styles.summaryTime}>{prettyTime(lastSummary.elapsedMs)}</Text>
            </View>
            <View style={styles.summaryActions}>
              <TouchableOpacity style={styles.primaryButton} onPress={handleReplaySame}>
                <Text style={styles.primaryButtonText}>Tekrar Oyna</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={goToMenu}>
                <Text style={styles.secondaryButtonText}>Menüye Dön</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 8,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  closeIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#64748B',
  },
  headerCenter: {
    flex: 1,
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
  },
  menuContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  difficultySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    marginTop: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 10,
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  difficultyChip: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  difficultyChipActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  difficultyChipText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  difficultyChipTextActive: {
    color: '#1D4ED8',
  },
  difficultyChipSub: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
    marginTop: 2,
  },
  primaryButton: {
    height: 52,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#16A34A',
    marginTop: 4,
    shadowColor: '#16A34A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  historySection: {
    flex: 1,
    marginTop: 4,
  },
  historyEmpty: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
  },
  historyList: {
    paddingVertical: 6,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  historyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyDifficulty: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  historyDate: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  historyGrid: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  historyTime: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16A34A',
    marginTop: 2,
  },
  playContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  playHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 8,
  },
  playBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#16A34A',
  },
  playMovesText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#E0F2FE',
    borderRadius: 24,
    padding: 10,
    gap: 8,
    marginBottom: 12,
  },
  cardBase: {
    flexBasis: '22%',
    flexGrow: 1,
    aspectRatio: 3 / 4,
    borderRadius: 14,
    backgroundColor: '#0EA5E9',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardBaseFlipped: {
    backgroundColor: '#ECFEFF',
  },
  cardMatched: {
    backgroundColor: '#BBF7D0',
  },
  cardInner: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 32,
  },
  cardBackPattern: {
    width: '120%',
    height: '120%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardBackLeaf: {
    width: '80%',
    height: 8,
    borderRadius: 999,
    backgroundColor: '#38BDF8',
    transform: [{ rotate: '-12deg' }],
  },
  cardBackLeafSmall: {
    width: '50%',
    backgroundColor: '#22C55E',
    marginTop: 6,
    transform: [{ rotate: '10deg' }],
  },
  playActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  summaryContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 20,
    textAlign: 'center',
  },
  summaryCard: {
    width: '100%',
    borderRadius: 28,
    padding: 24,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    marginBottom: 24,
  },
  summaryBadge: {
    fontSize: 13,
    fontWeight: '800',
    color: '#16A34A',
    marginBottom: 6,
  },
  summaryMain: {
    fontSize: 24,
    fontWeight: '900',
    color: '#14532D',
  },
  summaryTime: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '700',
    color: '#166534',
  },
  summaryActions: {
    width: '100%',
    gap: 10,
  },
});

export default MemoryGardenScreen;

