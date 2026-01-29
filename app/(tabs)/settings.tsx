import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../utils/authContext';
import { AGE_GROUPS, normalizeAgeGroup } from '../utils/ageGroups';
import { getCategoriesByIds } from '../utils/categories';

const Badge = ({ text }: { text: string }) => {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{text}</Text>
    </View>
  );
};

const SettingsScreen = () => {
  const router = useRouter();
  const { profile } = useAuth();

  const currentAgeGroup = profile?.age_group ? normalizeAgeGroup(profile.age_group) : null;
  const currentAgeGroupLabel = currentAgeGroup ? AGE_GROUPS[currentAgeGroup].label : null;
  const currentCategories = getCategoriesByIds(profile?.preferred_categories || []);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Profile Section */}
          <View style={styles.section}>
            <View style={styles.profileCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>🎮</Text>
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{profile?.nickname || 'Oyuncu'}</Text>
                <Text style={styles.profileSub}>Macera Seviyesi: 1</Text>
                <View style={styles.badgesWrap}>
                  {currentAgeGroupLabel ? <Badge text={currentAgeGroupLabel} /> : null}
                  {currentCategories.map((c) => (
                    <Badge key={c.id} text={`${c.emoji} ${c.name}`} />
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Policies Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>POLİTİKALAR</Text>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Gizlilik Politikası</Text>
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Kullanım Koşulları</Text>
            </View>
          </View>

          {/* Account Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>HESAP</Text>
            <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/age-selection')}>
              <Text style={styles.actionButtonText}>Profil Ayarları</Text>
              <Text style={styles.actionIcon}>→</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.versionInfo}>
            <Text style={styles.versionText}>Peeky v1.0.0</Text>
            <Text style={styles.versionText}>Çocuklar için sevgiyle hazırlandı ❤️</Text>
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
  scrollContent: {
    paddingHorizontal: 25,
    paddingTop: 30,
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
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 30,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
  },
  profileSub: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
  badgesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  badge: {
    backgroundColor: '#F1F5F9',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  settingRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  actionIcon: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: '900',
  },
  logoutButton: {
    marginTop: 10,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FEF2F2',
    backgroundColor: '#FFF',
  },
  logoutText: {
    color: '#EF4444',
  },
  versionInfo: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  versionText: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '600',
    lineHeight: 18,
  },
});

export default SettingsScreen;

