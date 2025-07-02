import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Animated,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useSteps } from '../context/StepContext';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const { userProfile } = useAuth();
  const { todaySteps, getTotalSteps, badges, badgeDefinitions, getNextBadge, formatNumber } = useSteps();
  const [refreshing, setRefreshing] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for step counter
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Günaydın';
    if (hour < 18) return 'İyi öğlen';
    return 'İyi akşamlar';
  };

  const getProgressPercentage = () => {
    const nextBadge = getNextBadge();
    if (!nextBadge) return 100;
    return Math.min((getTotalSteps() / nextBadge.steps) * 100, 100);
  };

  const nextBadge = getNextBadge();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4F46E5', '#7C3AED']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View
          style={[
            styles.headerContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.welcomeSection}>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.userName}>{userProfile?.name || 'Atlet'}!</Text>
            <Text style={styles.subtitle}>Bugün kaç adım atacaksın?</Text>
          </View>
          
          <View style={styles.logoSection}>
            <Ionicons name="footsteps" size={30} color="white" />
            <Text style={styles.brandText}>by rumet</Text>
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Animated.View
          style={[
            styles.statsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Daily Steps Card */}
          <Animated.View
            style={[
              styles.stepCard,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <LinearGradient
              colors={['#F59E0B', '#EAB308']}
              style={styles.stepCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.stepCardHeader}>
                <Ionicons name="footsteps" size={32} color="white" />
                <Text style={styles.stepCardTitle}>Bugünkü Adımlar</Text>
              </View>
              <Text style={styles.stepCount}>{formatNumber(todaySteps)}</Text>
              <Text style={styles.stepSubtitle}>Harika gidiyorsun! 🔥</Text>
            </LinearGradient>
          </Animated.View>

          {/* Total Steps Card */}
          <View style={styles.totalStepsCard}>
            <LinearGradient
              colors={['#10B981', '#059669']}
              style={styles.cardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.cardHeader}>
                <Ionicons name="trophy" size={24} color="white" />
                <Text style={styles.cardTitle}>Toplam Adım</Text>
              </View>
              <Text style={styles.cardValue}>{formatNumber(getTotalSteps())}</Text>
            </LinearGradient>
          </View>

          {/* Badges Section */}
          <View style={styles.badgesSection}>
            <Text style={styles.sectionTitle}>🏆 Rozetlerim</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.badgesContainer}
            >
              {badgeDefinitions.map((badge) => {
                const isEarned = badges.includes(badge.id);
                return (
                  <TouchableOpacity
                    key={badge.id}
                    style={[
                      styles.badgeItem,
                      { opacity: isEarned ? 1 : 0.4 },
                    ]}
                  >
                    <View
                      style={[
                        styles.badgeCircle,
                        { backgroundColor: isEarned ? badge.color : '#E5E7EB' },
                      ]}
                    >
                      <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
                    </View>
                    <Text style={styles.badgeName}>{badge.name}</Text>
                    <Text style={styles.badgeSteps}>
                      {formatNumber(badge.steps)} adım
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Next Badge Progress */}
          {nextBadge && (
            <View style={styles.progressSection}>
              <Text style={styles.sectionTitle}>🎯 Sonraki Hedef</Text>
              <View style={styles.progressCard}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressBadgeName}>{nextBadge.name}</Text>
                  <Text style={styles.progressPercentage}>
                    {Math.round(getProgressPercentage())}%
                  </Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <Animated.View
                      style={[
                        styles.progressFill,
                        { width: `${getProgressPercentage()}%` },
                      ]}
                    />
                  </View>
                </View>
                <Text style={styles.progressText}>
                  {formatNumber(getTotalSteps())} / {formatNumber(nextBadge.steps)} adım
                </Text>
              </View>
            </View>
          )}

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <Text style={styles.sectionTitle}>📊 Hızlı İstatistikler</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Ionicons name="school" size={20} color="#4F46E5" />
                <Text style={styles.statLabel}>Sınıf</Text>
                <Text style={styles.statValue}>{userProfile?.class || '-'}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="library" size={20} color="#7C3AED" />
                <Text style={styles.statLabel}>Seviye</Text>
                <Text style={styles.statValue}>{userProfile?.grade || '-'}</Text>
              </View>
              <View style={styles.statItem}>
                <Ionicons name="ribbon" size={20} color="#EC4899" />
                <Text style={styles.statLabel}>Rozet</Text>
                <Text style={styles.statValue}>{badges.length}</Text>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              StepZ ile adım at, yarış! 
            </Text>
            <Text style={styles.footerCredit}>Made with ❤️ by RUMET ASAN</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  logoSection: {
    alignItems: 'center',
  },
  brandText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
    marginTop: 4,
  },
  content: {
    flex: 1,
    marginTop: -10,
  },
  statsContainer: {
    padding: 20,
  },
  stepCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  stepCardGradient: {
    padding: 20,
    alignItems: 'center',
  },
  stepCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  stepCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
  stepCount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  totalStepsCard: {
    marginBottom: 20,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardGradient: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  badgesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  badgesContainer: {
    paddingRight: 20,
  },
  badgeItem: {
    alignItems: 'center',
    marginRight: 15,
    width: 80,
  },
  badgeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeEmoji: {
    fontSize: 24,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 2,
  },
  badgeSteps: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
  progressSection: {
    marginBottom: 20,
  },
  progressCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  progressBadgeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  progressBarContainer: {
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  quickStats: {
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 5,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 5,
  },
  footerCredit: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});

export default HomeScreen;