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
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'QuestionGame'>;

interface Question {
  text: string;
  options: string[];
  correct: number;
}

const SAMPLE_QUESTIONS: Question[] = [
  {
    text: "Dünya'nın en büyük hayvanı hangisidir?",
    options: ['Aslan', 'Mavi Balina', 'Fil', 'Zürafa'],
    correct: 1,
  },
  {
    text: 'Hangi gezegen "Kızıl Gezegen" olarak bilinir?',
    options: ['Venüs', 'Mars', 'Jüpiter', 'Satürn'],
    correct: 1,
  },
  {
    text: 'Bir haftada kaç gün vardır?',
    options: ['5', '6', '7', '8'],
    correct: 2,
  },
  {
    text: 'Güneş bir nedir?',
    options: ['Gezegen', 'Uydu', 'Yıldız', 'Kuyruklu Yıldız'],
    correct: 2,
  },
];

const QuestionGameScreen = ({ navigation, route }: Props) => {
  const { theme } = useTheme();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [gameEnded, setGameEnded] = useState(false);

  const transitionAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  const question = SAMPLE_QUESTIONS[currentQuestion];

  useEffect(() => {
    // Initial progress bar animation
    updateProgress();
  }, [currentQuestion]);

  const updateProgress = () => {
    Animated.timing(progressAnim, {
      toValue: (currentQuestion + 1) / SAMPLE_QUESTIONS.length,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  const handleAnswerSelect = (index: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(index);
    if (index === question.correct) {
      setScore(score + 1);
    }

    setTimeout(() => {
      if (currentQuestion < SAMPLE_QUESTIONS.length - 1) {
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

  const handleRestart = () => {
    setCurrentQuestion(0);
    setScore(0);
    setSelectedAnswer(null);
    setGameEnded(false);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  if (gameEnded) {
    const percentage = Math.round((score / SAMPLE_QUESTIONS.length) * 100);
    return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.resultContainer}>
            <Text style={styles.resultTitle}>{percentage >= 70 ? 'Harikasın! 🥳' : 'İyi İş Çıkardın! 👏'}</Text>
            <View style={[styles.scoreCard, { backgroundColor: theme.colors.primary + '15' }]}>
              <Text style={[styles.finalScore, { color: theme.colors.primary }]}>{score} / {SAMPLE_QUESTIONS.length}</Text>
              <Text style={styles.finalSub}>Doğru Cevap</Text>
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
            <Text style={styles.progressLabel}>{currentQuestion + 1} / {SAMPLE_QUESTIONS.length}</Text>
          </View>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreBadgeText}>⭐ {score}</Text>
          </View>
        </View>

        <Animated.View style={[styles.mainContent, { opacity: fadeAnim }]}>
          {/* Question Card */}
          <View style={styles.questionCard}>
            <Text style={styles.questionType}>GENEL KÜLTÜR</Text>
            <Text style={styles.questionText}>{question.text}</Text>
          </View>

          {/* Options List */}
          <View style={styles.optionsList}>
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === question.correct;
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
