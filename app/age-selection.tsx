import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from './utils/authContext';
import { useTheme } from './utils/themeContext';
import { AGE_GROUPS, AgeGroup, normalizeAgeGroup } from './utils/ageGroups';
import { CATEGORIES } from './utils/categories';

const AgeSelectionScreen = () => {
  const router = useRouter();
  const { profile, selectAgeGroup } = useAuth();
  const { setAgeGroup } = useTheme();

  const [nickname, setNickname] = useState(profile?.nickname || '');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup | null>(
    profile?.age_group ? normalizeAgeGroup(profile.age_group) : null
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    profile?.preferred_categories || []
  );

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleSave = async () => {
    if (!nickname.trim()) {
      return;
    }
    if (!selectedAgeGroup) {
      return;
    }

    try {
      setAgeGroup(selectedAgeGroup);
      await selectAgeGroup(selectedAgeGroup, nickname.trim(), selectedCategories);
      router.back();
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profil Ayarları</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Nickname Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>İSİM</Text>
            <TextInput
              style={styles.input}
              placeholder="Adını buraya yaz..."
              placeholderTextColor="#94A3B8"
              value={nickname}
              onChangeText={setNickname}
              maxLength={20}
            />
          </View>

          {/* Age Group Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>YAŞ GRUBU</Text>
            <View style={styles.ageGrid}>
              {Object.entries(AGE_GROUPS).map(([key, group]) => {
                const isSelected = selectedAgeGroup === key;
                return (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setSelectedAgeGroup(key as AgeGroup)}
                    style={[
                      styles.ageOption,
                      isSelected && { backgroundColor: '#7000FF', borderColor: '#7000FF' },
                    ]}
                  >
                    <Text style={[styles.ageLabel, isSelected && styles.whiteText]}>
                      {group.label}
                    </Text>
                    <Text style={[styles.ageRange, isSelected && styles.whiteTextLight]}>
                      {group.ageRange}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Categories Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>İLGİ ALANLARI</Text>
            <View style={styles.catGrid}>
              {CATEGORIES.map((category) => {
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <TouchableOpacity
                    key={category.id}
                    onPress={() => handleCategoryToggle(category.id)}
                    style={[
                      styles.catOption,
                      isSelected && { backgroundColor: '#7000FF', borderColor: '#7000FF' },
                    ]}
                  >
                    <Text style={styles.catEmoji}>{category.emoji}</Text>
                    <Text style={[styles.catName, isSelected && styles.whiteText]}>
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!nickname.trim() || !selectedAgeGroup) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!nickname.trim() || !selectedAgeGroup}
          >
            <Text style={styles.saveButtonText}>Kaydet</Text>
          </TouchableOpacity>
        </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  scrollContent: {
    paddingHorizontal: 25,
    paddingTop: 20,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.5,
    marginBottom: 15,
    paddingLeft: 5,
  },
  input: {
    height: 65,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
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
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
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
  footer: {
    padding: 25,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  saveButton: {
    height: 65,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#7000FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  saveButtonDisabled: {
    backgroundColor: '#E2E8F0',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
});

export default AgeSelectionScreen;
