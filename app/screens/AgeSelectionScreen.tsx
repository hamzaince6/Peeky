import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useAuth } from '../utils/authContext';
import { useTheme } from '../utils/themeContext';
import { AGE_GROUPS, AgeGroup } from '../utils/ageGroups';
import { PrimaryButton } from '../components/ui/PrimaryButton';
import { useResponsiveDimensions } from '../hooks/useResponsiveDimensions';

type Props = NativeStackScreenProps<RootStackParamList, 'AgeSelection'>;

const AgeSelectionScreen = ({ navigation }: Props) => {
  const { selectAgeGroup } = useAuth();
  const { setAgeGroup } = useTheme();
  const { isTablet, gridColumns, contentPadding } = useResponsiveDimensions();
  const [selectedGroup, setSelectedGroup] = useState<AgeGroup | null>(null);
  const [nickname, setNickname] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSelectGroup = (group: AgeGroup) => {
    setSelectedGroup(group);
    setError('');
  };

  const handleContinue = async () => {
    if (!selectedGroup || !nickname.trim()) {
      setError('Lütfen yaş grubu seçin ve ad girin');
      return;
    }

    try {
      setIsLoading(true);
      setAgeGroup(selectedGroup);
      await selectAgeGroup(selectedGroup, nickname.trim());

      navigation.navigate('GameHub', {
        ageGroup: selectedGroup,
        nickname: nickname.trim(),
      });
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const groupColumns = isTablet ? 2 : 1;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: contentPadding },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🎮 Peeky'e Hoş Geldin!</Text>
            <Text style={styles.subtitle}>
              Önce sana uygun yaş grubu seçelim
            </Text>
          </View>

          {/* Name Input */}
          <View style={styles.nameInputSection}>
            <Text style={styles.label}>Adını yazabilir misin?</Text>
            <TextInput
              style={[styles.input, { paddingHorizontal: contentPadding }]}
              placeholder="Örn: Ahmet"
              placeholderTextColor="#999"
              value={nickname}
              onChangeText={setNickname}
              maxLength={20}
              editable={!isLoading}
            />
          </View>

          {/* Age Groups Selection */}
          <Text style={styles.sectionTitle}>Senin yaş grubun hangisi?</Text>

          <View
            style={[
              styles.groupsGrid,
              { flexDirection: 'row', flexWrap: 'wrap' },
            ]}
          >
            {Object.entries(AGE_GROUPS).map(([key, group]) => (
              <TouchableOpacity
                key={key}
                onPress={() => handleSelectGroup(key as AgeGroup)}
                disabled={isLoading}
                style={[
                  styles.groupCard,
                  {
                    width: `${100 / groupColumns}%`,
                    backgroundColor:
                      selectedGroup === key
                        ? group.colors.primary
                        : group.colors.background,
                    borderColor:
                      selectedGroup === key
                        ? group.colors.accent
                        : group.colors.secondary,
                    opacity: isLoading ? 0.5 : 1,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.groupLabel,
                    {
                      color:
                        selectedGroup === key
                          ? '#fff'
                          : group.colors.text,
                    },
                  ]}
                >
                  {group.label}
                </Text>
                <Text
                  style={[
                    styles.ageRange,
                    {
                      color:
                        selectedGroup === key
                          ? '#fff'
                          : group.colors.text,
                      opacity: selectedGroup === key ? 0.9 : 0.7,
                    },
                  ]}
                >
                  {group.ageRange}
                </Text>
                <Text
                  style={[
                    styles.description,
                    {
                      color:
                        selectedGroup === key
                          ? '#fff'
                          : group.colors.text,
                      opacity: selectedGroup === key ? 0.85 : 0.6,
                      fontSize: 12,
                    },
                  ]}
                >
                  {group.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Continue Button */}
          <View style={styles.buttonContainer}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#FF6347" />
            ) : (
              <PrimaryButton
                label="Oyunlara Başla! 🎮"
                onPress={handleContinue}
                size="large"
              />
            )}
          </View>

          <Text style={styles.footerText}>
            Daha sonra yaş grubunu değiştirebilirsin
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  nameInputSection: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  groupsGrid: {
    marginBottom: 24,
    gap: 12,
  },
  groupCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  groupLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  ageRange: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    textAlign: 'center',
  },
  buttonContainer: {
    marginVertical: 20,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    fontWeight: '500',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default AgeSelectionScreen;
