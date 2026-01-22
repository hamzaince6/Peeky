import React from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

const HistoryScreen = () => {
    const historyItems = [
        { id: '1', game: 'Soru Dünyası', score: '8/10', date: 'Bugün, 14:20', color: '#7000FF' },
        { id: '2', game: 'Soru Dünyası', score: '9/10', date: 'Dün, 18:45', color: '#7000FF' },
        { id: '3', game: 'Soru Dünyası', score: '10/10', date: '21 Ocak, 11:30', color: '#7000FF' },
    ];

    return (
        <View style={styles.container}>
            <StatusBar style="dark" />
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <Text style={styles.title}>Geçmiş</Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    {historyItems.map((item) => (
                        <View key={item.id} style={styles.historyCard}>
                            <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
                                <Text style={styles.iconText}>🏆</Text>
                            </View>
                            <View style={styles.infoBox}>
                                <Text style={styles.gameName}>{item.game}</Text>
                                <Text style={styles.dateText}>{item.date}</Text>
                            </View>
                            <View style={styles.scoreBox}>
                                <Text style={[styles.scoreText, { color: item.color }]}>{item.score}</Text>
                            </View>
                        </View>
                    ))}

                    <View style={styles.emptyState}>
                        <Text style={styles.emptyEmoji}>🌟</Text>
                        <Text style={styles.emptyText}>Daha fazla oyun oyna, listeyi doldur!</Text>
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
        paddingBottom: 120, // Space for floating tab bar
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
