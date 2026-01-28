import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from './utils/authContext';
import { useTheme } from './utils/themeContext';
import { AGE_GROUPS, AgeGroup } from './utils/ageGroups';
import { CATEGORIES } from './utils/categories';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');
const TOTAL_STEPS = 3;
const STEP_COLORS = ['#7000FF', '#FF0080', '#FF9500'];

const MultiStepOnboardingScreen = () => {
  const { selectAgeGroup } = useAuth();
  const { setAgeGroup } = useTheme();

  const [currentStep, setCurrentStep] = useState(1);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const [nickname, setNickname] = useState('');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const currentColor = STEP_COLORS[currentStep - 1];

  const animateTransition = (direction: 'next' | 'prev', callback: () => void) => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: direction === 'next' ? -20 : 20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
      slideAnim.setValue(direction === 'next' ? 20 : -20);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleNext = () => {
    setError('');
    if (currentStep === 1) {
      if (!nickname.trim()) {
        setError('Lütfen seninle tanışmamız için bir isim gir 😊');
        return;
      }
      animateTransition('next', () => setCurrentStep(2));
    } else if (currentStep === 2) {
      if (!selectedAgeGroup) {
        setError('Sana uygun oyunları seçmemiz için yaşını işaretlemelisin');
        return;
      }
      animateTransition('next', () => setCurrentStep(3));
    } else if (currentStep === 3) {
      if (selectedCategories.length === 0) {
        setError('En az bir ilgi alanı seçmelisin');
        return;
      }
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      animateTransition('prev', () => {
        setCurrentStep(currentStep - 1);
        setError('');
      });
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
    setError('');
  };

  const handleComplete = async () => {
    try {
      setIsLoading(true);
      if (selectedAgeGroup) {
        setAgeGroup(selectedAgeGroup);
        await selectAgeGroup(selectedAgeGroup, nickname.trim(), selectedCategories);
      }
    } catch (err) {
      setError('Bir hata oluştu! Lütfen tekrar dene.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBack}
            style={[styles.backButton, currentStep === 1 && { opacity: 0 }]}
            disabled={currentStep === 1 || isLoading}
          >
            <Text style={[styles.backIcon, { color: currentColor }]}>←</Text>
          </TouchableOpacity>

          <View style={styles.progressBarContainer}>
            <View style={styles.progressTrack}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    width: `${(currentStep / TOTAL_STEPS) * 100}%`,
                    backgroundColor: currentColor
                  }
                ]}
              />
            </View>
            <Text style={[styles.stepText, { color: currentColor }]}>ADIM {currentStep} / {TOTAL_STEPS}</Text>
          </View>

          <View style={{ width: 44 }} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.flex1}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <Animated.View
            style={[
              styles.content,
              { opacity: fadeAnim, transform: [{ translateX: slideAnim }] },
            ]}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {currentStep === 1 && (
                <View style={styles.stepBox}>
                  <Text style={[styles.title, { color: currentColor }]}>Harika Bir Başlangıç!</Text>
                  <Text style={styles.subtitle}>Sana özel bir dünya kurmak için adını öğrenebilir miyiz?</Text>
                  <TextInput
                    style={[styles.modernInput, { borderColor: currentColor + '40' }]}
                    placeholder="Adını buraya yaz..."
                    placeholderTextColor="#94A3B8"
                    value={nickname}
                    onChangeText={(text) => { setNickname(text); setError(''); }}
                    maxLength={20}
                    autoFocus
                  />
                </View>
              )}

              {currentStep === 2 && (
                <View style={styles.stepBox}>
                  <Text style={[styles.title, { color: currentColor }]}>Kaç Yaşındasın?</Text>
                  <Text style={styles.subtitle}>Yaşına göre en eğlenceli içerikleri senin için seçeceğiz.</Text>
                  <View style={styles.ageGrid}>
                    {Object.entries(AGE_GROUPS).map(([key, group]) => {
                      const isSelected = selectedAgeGroup === key;
                      return (
                        <TouchableOpacity
                          key={key}
                          onPress={() => { setSelectedAgeGroup(key as AgeGroup); setError(''); }}
                          style={[
                            styles.ageOption,
                            isSelected && { backgroundColor: currentColor, borderColor: currentColor }
                          ]}
                        >
                          <Text style={[styles.ageLabel, isSelected && styles.whiteText]}>{group.label}</Text>
                          <Text style={[styles.ageRange, isSelected && styles.whiteTextLight]}>{group.ageRange}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {currentStep === 3 && (
                <View style={styles.stepBox}>
                  <Text style={[styles.title, { color: currentColor }]}>Senin Dünyan, Senin Tercihin!</Text>
                  <Text style={styles.subtitle}>Hangi konularda ilerlemek istersin? (Birden fazla seçebilirsin)</Text>
                  <View style={styles.catGrid}>
                    {CATEGORIES.map((category) => {
                      const isSelected = selectedCategories.includes(category.id);
                      return (
                        <TouchableOpacity
                          key={category.id}
                          onPress={() => handleCategoryToggle(category.id)}
                          style={[
                            styles.catOption,
                            isSelected && { backgroundColor: currentColor, borderColor: currentColor }
                          ]}
                        >
                          <Text style={styles.catEmoji}>{category.emoji}</Text>
                          <Text style={[styles.catName, isSelected && styles.whiteText]}>{category.name}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}
            </ScrollView>
          </Animated.View>

          <View style={styles.footer}>
            {isLoading ? (
              <ActivityIndicator size="large" color={currentColor} />
            ) : (
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: currentColor }]}
                onPress={handleNext}
                activeOpacity={0.9}
              >
                <Text style={styles.primaryButtonText}>
                  {currentStep === TOTAL_STEPS ? 'Dünyamı Oluştur' : 'Devam Et'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
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
  flex1: {
    flex: 1,
  },
  header: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
  },
  backIcon: {
    fontSize: 22,
    fontWeight: '700',
  },
  progressBarContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  progressTrack: {
    width: '80%',
    height: 6,
    backgroundColor: '#F1F5F9',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  stepText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 20,
  },
  stepBox: {
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
    marginTop: 10,
    marginBottom: 30,
    fontWeight: '500',
  },
  modernInput: {
    height: 65,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1.5,
    paddingHorizontal: 20,
    fontSize: 18,
    fontWeight: '600',
    color: '#0F172A',
  },
  ageGrid: {
    gap: 12,
  },
  ageOption: {
    width: '100%',
    padding: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ageLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  ageRange: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  whiteText: {
    color: '#FFFFFF',
  },
  whiteTextLight: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  catOption: {
    width: '48.5%',
    aspectRatio: 1.1,
    backgroundColor: '#F8FAFC',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  catName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  errorContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#FEF2F2',
    borderRadius: 15,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    padding: 25,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  primaryButton: {
    height: 65,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
});

export default MultiStepOnboardingScreen;
