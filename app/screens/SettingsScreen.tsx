import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../utils/authContext';

const SettingsScreen = ({ navigation }: any) => {
    const { profile, logout } = useAuth();
    const [isNotifications, setNotifications] = React.useState(true);
    const [isSounds, setSounds] = React.useState(true);

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
                            </View>
                        </View>
                    </View>

                    {/* Preferences Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>TERCİHLER</Text>
                        <View style={styles.settingRow}>
                            <Text style={styles.settingLabel}>Bildirimler</Text>
                            <Switch
                                value={isNotifications}
                                onValueChange={setNotifications}
                                trackColor={{ false: '#E2E8F0', true: '#7000FF' }}
                            />
                        </View>
                        <View style={styles.settingRow}>
                            <Text style={styles.settingLabel}>Ses Efektleri</Text>
                            <Switch
                                value={isSounds}
                                onValueChange={setSounds}
                                trackColor={{ false: '#E2E8F0', true: '#FF0080' }}
                            />
                        </View>
                    </View>

                    {/* Account Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>HESAP</Text>
                        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('AgeSelection')}>
                            <Text style={styles.actionButtonText}>Yaş Grubunu Değiştir</Text>
                            <Text style={styles.actionIcon}>→</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, styles.logoutButton]} onPress={logout}>
                            <Text style={[styles.actionButtonText, styles.logoutText]}>Çıkış Yap</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.versionInfo}>
                        <Text style={styles.versionText}>Peeky v1.0.0</Text>
                        <Text style={styles.versionText}>Made with ❤️ for Kids</Text>
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
