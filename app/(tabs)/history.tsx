import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const QUESTION_HISTORY_KEY = 'peeky_question_history';

type QuestionGameHistoryItem = {
  id: string;
  createdAt: string;
  game: 'Soru Dünyası';
  score: number;
  total: number;
  percentage: number;
  ageGroup?: string;
};

const HistoryScreen = () => {
  const [questionHistory, setQuestionHistory] = useState<QuestionGameHistoryItem[]>([]);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const raw = await AsyncStorage.getItem(QUESTION_HISTORY_KEY);
        if (!raw) {
          setQuestionHistory([]);
          return;
        }
        const parsed: QuestionGameHistoryItem[] = JSON.parse(raw);
        setQuestionHistory(parsed);
      } catch (e) {
        console.warn('Failed to load question history', e);
        setQuestionHistory([]);
      }
    };

    loadHistory();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.title}>Geçmiş</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {questionHistory.map((item) => {
            const date = new Date(item.createdAt);
            const formattedDate = date.toLocaleString('tr-TR', {
              day: '2-digit',
              month: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            });
            const scoreText = `${item.score}/${item.total}`;
            const color = '#7000FF';

            return (
              <View key={item.id} style={styles.historyCard}>
                <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
                  <Text style={styles.iconText}>🏆</Text>
                </View>
                <View style={styles.infoBox}>
                  <Text style={styles.gameName}>{item.game}</Text>
                  <Text style={styles.dateText}>{formattedDate}</Text>
                </View>
                <View style={styles.scoreBox}>
                  <Text style={[styles.scoreText, { color }]}>{scoreText}</Text>
                </View>
              </View>
            );
          })}

          {questionHistory.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🌟</Text>
              <Text style={styles.emptyText}>Daha fazla oyun oyna, listeyi doldur!</Text>
            </View>
          )}
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
  header: {
    paddingHorizontal: 30,
    paddingTop: 15,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 120,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  iconBox: {
    width: 54,
    height: 54,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconText: {
    fontSize: 24,
  },
  infoBox: {
    flex: 1,
  },
  gameName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  dateText: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
  scoreBox: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
    opacity: 0.5,
  },
  emptyEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default HistoryScreen;

