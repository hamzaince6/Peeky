import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useTheme } from '../utils/themeContext';
import { useAuth } from '../utils/authContext';
import { aiService, Question } from '../services/aiService';
import { getCategoriesByIds, getCategoryById } from '../utils/categories';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'QuestionGame'>;

const QUESTIONS_PER_GAME = 10;

const QuestionGameScreen = ({ navigation, route }: Props) => {
  const { theme } = useTheme();
  const { profile, ageGroup } = useAuth();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [gameEnded, setGameEnded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  }, []);

  // Update progress when question changes
  useEffect(() => {
    if (questions.length > 0) {
      updateProgress();
    }
  }, [currentQuestion, questions.length]);

  const loadQuestions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const userAgeGroup = ageGroup || route.params?.ageGroup || 'G3';
      const userCategories = profile?.preferred_categories || [];

      // Load questions from user's selected categories
      const loadedQuestions = await aiService.getQuestionsWithFallback(
        userAgeGroup,
        QUESTIONS_PER_GAME,
        undefined, // single category
        userCategories.length > 0 ? userCategories : undefined // multiple categories
      );

      if (loadedQuestions.length === 0) {
        setError('Soru yüklenemedi. Lütfen tekrar deneyin.');
        return;
      }

      setQuestions(loadedQuestions);
    } catch (err) {
      console.error('Load questions error:', err);
      setError('Sorular yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProgress = () => {
    if (questions.length === 0) return;
    Animated.timing(progressAnim, {
      toValue: (currentQuestion + 1) / questions.length,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const getCurrentCategoryName = () => {
    if (questions.length === 0 || currentQuestion >= questions.length) return 'GENEL';
    const question = questions[currentQuestion];
    const topic = question.topic;
    
    const topicToCategory: Record<string, string> = {
      'math': 'MATEMATİK',
      'science': 'FEN BİLİMLERİ',
      'reading': 'TÜRKÇE',
      'history': 'TARİH',
      'geography': 'COĞRAFYA',
      'general_knowledge': 'GENEL KÜLTÜR',
    };
    
    return topicToCategory[topic || ''] || 'GENEL KÜLTÜR';
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>
              Sorular hazırlanıyor... 🎯
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (error || questions.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>⚠️</Text>
            <Text style={styles.errorText}>{error || 'Soru yüklenemedi'}</Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
              onPress={loadQuestions}
            >
              <Text style={styles.retryButtonText}>Tekrar Dene</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Text style={styles.backButtonText}>Ana Sayfaya Dön</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  const question = questions[currentQuestion];

  const handleAnswerSelect = (index: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(index);
    const isCorrect = index === question.correct_index;
    if (isCorrect) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        animateNextQuestion();
      } else {
        setGameEnded(true);
      }
    }, 1200);
  };

  const animateNextQuestion = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleRestart = async () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setGameEnded(false);
    // Load new questions for replay
    await loadQuestions();
  };

  const handleBack = () => {
    navigation.goBack();
  };

  if (gameEnded) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>{percentage >= 70 ? 'Harikasın! 🥳' : 'İyi İş Çıkardın! 👏'}</Text>
            <View style={[styles.scoreCard, { backgroundColor: theme.colors.primary + '15' }]}>
              <Text style={[styles.finalScore, { color: theme.colors.primary }]}>{score} / {questions.length}</Text>
              <Text style={styles.finalSub}>Doğru Cevap</Text>
              <Text style={styles.percentageText}>%{percentage} Başarı</Text>
            </View>
            <View style={styles.resultFooter}>
              <TouchableOpacity style={[styles.mainButton, { backgroundColor: '#0F172A' }]} onPress={handleRestart}>
                <Text style={styles.mainButtonText}>Tekrar Oyna</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={handleBack}>
                <Text style={styles.secondaryButtonText}>Ana Sayfaya Dön</Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        {/* Header Section */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.closeButton}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%']
                    }),
                    backgroundColor: theme.colors.primary
                  }
                ]}
              />
            </View>
            <Text style={styles.progressLabel}>{currentQuestion + 1} / {questions.length}</Text>
          </View>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreBadgeText}>⭐ {score}</Text>
          </View>
        </View>

        <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
          {/* Question Card */}
          <View style={styles.questionCard}>
            <Text style={styles.questionType}>{getCurrentCategoryName()}</Text>
            <Text style={styles.questionText}>{question.text}</Text>
          </View>

          {/* Options List */}
          <View style={styles.optionsList}>
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === question.correct_index;
              const showCorrect = selectedAnswer !== null && isCorrect;
              const showWrong = isSelected && !isCorrect;

              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={0.8}
                  onPress={() => handleAnswerSelect(index)}
                  disabled={selectedAnswer !== null}
                  style={[
                    styles.optionButton,
                    showCorrect && styles.optionCorrect,
                    showWrong && styles.optionWrong,
                  ]}
                >
                  <View style={[
                    styles.letterBox,
                    showCorrect && styles.letterBoxCorrect,
                    showWrong && styles.letterBoxWrong,
                  ]}>
                    <Text style={[
                      styles.letterText,
                      (showCorrect || showWrong) && styles.whiteText
                    ]}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                  <Text style={[
                    styles.optionText,
                    (showCorrect || showWrong) && styles.whiteText
                  ]}>
                    {option}
                  </Text>
                  {showCorrect && <Text style={styles.feedbackEmoji}>✔️</Text>}
                  {showWrong && <Text style={styles.feedbackEmoji}>❌</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    height: 80,
    justifyContent: 'space-between',
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  closeIcon: {
    fontSize: 20,
    color: '#64748B',
    fontWeight: '700',
  },
  progressContainer: {
    flex: 1,
    marginHorizontal: 15,
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
  },
  scoreBadge: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  scoreBadgeText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 25,
    paddingTop: 10,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 30,
    minHeight: 200,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
    marginBottom: 30,
  },
  questionType: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7000FF',
    letterSpacing: 2,
    marginBottom: 15,
  },
  questionText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 32,
  },
  optionsList: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  optionCorrect: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  optionWrong: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  letterBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  letterBoxCorrect: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  letterBoxWrong: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  letterText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  optionText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#475569',
  },
  whiteText: {
    color: '#FFFFFF',
  },
  feedbackEmoji: {
    fontSize: 20,
    marginLeft: 10,
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 30,
    textAlign: 'center',
  },
  scoreCard: {
    width: '100%',
    padding: 40,
    borderRadius: 35,
    alignItems: 'center',
    marginBottom: 40,
  },
  finalScore: {
    fontSize: 48,
    fontWeight: '900',
  },
  finalSub: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: '700',
    marginTop: 5,
  },
  percentageText: {
    fontSize: 24,
    color: '#64748B',
    fontWeight: '800',
    marginTop: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 64,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '600',
  },
  retryButton: {
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 15,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  backButton: {
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  backButtonText: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '700',
  },
  resultFooter: {
    width: '100%',
    gap: 15,
  },
  mainButton: {
    height: 65,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
  },
  mainButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  secondaryButton: {
    height: 65,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E2E8F0',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#64748B',
  },
});

export default QuestionGameScreen;
