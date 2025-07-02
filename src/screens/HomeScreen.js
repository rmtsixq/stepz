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
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { useAuth } from '../context/AuthContext';
import { useSteps } from '../context/StepContext';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const { userProfile, fetchUserProfile } = useAuth();
  const { 
    todaySteps, 
    getTotalSteps, 
    badges, 
    badgeDefinitions, 
    getNextBadge, 
    formatNumber,
    getDailyProgress,
    getWeeklyAverage,
    weeklySteps,
    stepGoal,
    events,
    loadLeaderboards
  } = useSteps();
  
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  
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

    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => {
      pulseAnimation.stop();
      clearInterval(timeInterval);
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (userProfile) {
        await fetchUserProfile(userProfile.uid);
        await loadLeaderboards();
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 6) return 'İyi geceler';
    if (hour < 12) return 'Günaydın';
    if (hour < 17) return 'İyi öğlen';
    if (hour < 21) return 'İyi akşamlar';
    return 'İyi geceler';
  };

  const getMotivationalMessage = () => {
    const progress = getDailyProgress();
    
    if (progress >= 100) {
      return 'Tebrikler! Günlük hedefini tamamladın! 🎉';
    } else if (progress >= 75) {
      return 'Çok yakın! Son sprint! 💪';
    } else if (progress >= 50) {
      return 'Yarı yoldasın! Devam et! 🔥';
    } else if (progress >= 25) {
      return 'İyi bir başlangıç! Hızını artır! ⚡';
    } else {
      return 'Harekete geç! Her adım önemli! 🚀';
    }
  };

  const getActiveEvents = () => {
    const now = new Date();
    return events.filter(event => {
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      return now >= start && now <= end && event.isActive;
    }).slice(0, 2); // Show max 2 active events
  };

  const getUserRank = () => {
    // This would come from leaderboards context in a real implementation
    return Math.floor(Math.random() * 50) + 1; // Placeholder
  };

  const nextBadge = getNextBadge();
  const activeEvents = getActiveEvents();
  const dailyProgress = getDailyProgress();

  // Prepare chart data
  const chartData = {
    labels: weeklySteps.map(day => day.day),
    datasets: [
      {
        data: weeklySteps.map(day => day.steps),
        color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  const renderWeeklyChart = () => {
    if (weeklySteps.length === 0) {
      return (
        <View style={styles.chartPlaceholder}>
          <Ionicons name="bar-chart-outline" size={48} color="#9CA3AF" />
          <Text style={styles.chartPlaceholderText}>
            Veri toplanıyor...
          </Text>
        </View>
      );
    }

    return (
      <LineChart
        data={chartData}
        width={width - 60}
        height={200}
        chartConfig={{
          backgroundColor: 'transparent',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: '#4F46E5',
          },
        }}
        bezier
        style={styles.chart}
      />
    );
  };

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
            <Text style={styles.subtitle}>
              {currentTime.toLocaleDateString('tr-TR', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </Text>
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
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#4F46E5']}
            tintColor="#4F46E5"
          />
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
              colors={dailyProgress >= 100 ? ['#10B981', '#059669'] : ['#F59E0B', '#EAB308']}
              style={styles.stepCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.stepCardHeader}>
                <Ionicons name="footsteps" size={32} color="white" />
                <Text style={styles.stepCardTitle}>Bugünkü Adımlar</Text>
              </View>
              <Text style={styles.stepCount}>{formatNumber(todaySteps)}</Text>
              <Text style={styles.stepSubtitle}>{getMotivationalMessage()}</Text>
              
              {/* Daily Progress Bar */}
              <View style={styles.dailyProgressContainer}>
                <View style={styles.dailyProgressBar}>
                  <Animated.View
                    style={[
                      styles.dailyProgressFill,
                      { width: `${Math.min(dailyProgress, 100)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.dailyProgressText}>
                  {Math.round(dailyProgress)}% of {formatNumber(stepGoal)}
                </Text>
              </View>
            </LinearGradient>
          </Animated.View>

          {/* Quick Stats Row */}
          <View style={styles.quickStatsRow}>
            <View style={styles.quickStatItem}>
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={styles.quickStatGradient}
              >
                <Ionicons name="trophy" size={20} color="white" />
                <Text style={styles.quickStatValue}>{formatNumber(getTotalSteps())}</Text>
                <Text style={styles.quickStatLabel}>Toplam Adım</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.quickStatItem}>
              <LinearGradient
                colors={['#8B5CF6', '#7C3AED']}
                style={styles.quickStatGradient}
              >
                <Ionicons name="ribbon" size={20} color="white" />
                <Text style={styles.quickStatValue}>{badges.length}</Text>
                <Text style={styles.quickStatLabel}>Rozetler</Text>
              </LinearGradient>
            </View>
            
            <View style={styles.quickStatItem}>
              <LinearGradient
                colors={['#F59E0B', '#EAB308']}
                style={styles.quickStatGradient}
              >
                <Ionicons name="trending-up" size={20} color="white" />
                <Text style={styles.quickStatValue}>#{getUserRank()}</Text>
                <Text style={styles.quickStatLabel}>Sıralama</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Weekly Chart */}
          <View style={styles.chartSection}>
            <Text style={styles.sectionTitle}>📈 Haftalık Grafik</Text>
            <View style={styles.chartCard}>
              {renderWeeklyChart()}
              <View style={styles.chartInfo}>
                <Text style={styles.chartInfoText}>
                  Haftalık Ortalama: {formatNumber(getWeeklyAverage())} adım
                </Text>
              </View>
            </View>
          </View>

          {/* Active Events */}
          {activeEvents.length > 0 && (
            <View style={styles.eventsSection}>
              <Text style={styles.sectionTitle}>🔥 Aktif Etkinlikler</Text>
              {activeEvents.map((event, index) => (
                <TouchableOpacity
                  key={event.id}
                  style={styles.eventCard}
                  onPress={() => Alert.alert(event.title, event.description)}
                >
                  <LinearGradient
                    colors={['#EC4899', '#BE185D']}
                    style={styles.eventCardGradient}
                  >
                    <View style={styles.eventHeader}>
                      <Text style={styles.eventTitle}>{event.title}</Text>
                      <Ionicons name="chevron-forward" size={20} color="white" />
                    </View>
                    <Text style={styles.eventDescription} numberOfLines={2}>
                      {event.description}
                    </Text>
                    {event.multiplier && (
                      <Text style={styles.eventBonus}>
                        🎁 {((event.multiplier - 1) * 100).toFixed(0)}% Bonus!
                      </Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Badges Section */}
          <View style={styles.badgesSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🏆 Rozetlerim</Text>
              <Text style={styles.badgeCount}>{badges.length}/{badgeDefinitions.length}</Text>
            </View>
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
                    onPress={() => {
                      if (isEarned) {
                        Alert.alert(
                          `${badge.emoji} ${badge.name}`,
                          `Tebrikler! ${formatNumber(badge.steps)} adımla bu rozeti kazandın!`
                        );
                      }
                    }}
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
                  <View style={styles.progressBadgeInfo}>
                    <Text style={styles.progressBadgeEmoji}>{nextBadge.emoji}</Text>
                    <Text style={styles.progressBadgeName}>{nextBadge.name}</Text>
                  </View>
                  <Text style={styles.progressPercentage}>
                    {Math.round((getTotalSteps() / nextBadge.steps) * 100)}%
                  </Text>
                </View>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <Animated.View
                      style={[
                        styles.progressFill,
                        { width: `${Math.min((getTotalSteps() / nextBadge.steps) * 100, 100)}%` },
                      ]}
                    />
                  </View>
                </View>
                <Text style={styles.progressText}>
                  {formatNumber(getTotalSteps())} / {formatNumber(nextBadge.steps)} adım
                </Text>
                <Text style={styles.progressRemaining}>
                  {formatNumber(Math.max(nextBadge.steps - getTotalSteps(), 0))} adım kaldı!
                </Text>
              </View>
            </View>
          )}

          {/* User Info Stats */}
          <View style={styles.userInfoSection}>
            <Text style={styles.sectionTitle}>� Profilim</Text>
            <View style={styles.userInfoCard}>
              <View style={styles.userInfoRow}>
                <View style={styles.userInfoItem}>
                  <Ionicons name="school" size={20} color="#4F46E5" />
                  <Text style={styles.userInfoLabel}>Sınıf</Text>
                  <Text style={styles.userInfoValue}>{userProfile?.class || '-'}</Text>
                </View>
                <View style={styles.userInfoItem}>
                  <Ionicons name="library" size={20} color="#7C3AED" />
                  <Text style={styles.userInfoLabel}>Seviye</Text>
                  <Text style={styles.userInfoValue}>{userProfile?.grade || '-'}</Text>
                </View>
                <View style={styles.userInfoItem}>
                  <Ionicons name="calendar" size={20} color="#EC4899" />
                  <Text style={styles.userInfoLabel}>Yaş</Text>
                  <Text style={styles.userInfoValue}>{userProfile?.age || '-'}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              StepZ ile adım at, yarış! 🏃‍♂️
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
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
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
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  stepSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 15,
    textAlign: 'center',
  },
  dailyProgressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  dailyProgressBar: {
    width: '80%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  dailyProgressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 3,
  },
  dailyProgressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  quickStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quickStatItem: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickStatGradient: {
    padding: 15,
    alignItems: 'center',
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 5,
    marginBottom: 2,
  },
  quickStatLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  chartSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  badgeCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  chartPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartPlaceholderText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6B7280',
  },
  chartInfo: {
    marginTop: 10,
  },
  chartInfoText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  eventsSection: {
    marginBottom: 20,
  },
  eventCard: {
    marginBottom: 10,
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  eventCardGradient: {
    padding: 15,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    flex: 1,
  },
  eventDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  eventBonus: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  badgesSection: {
    marginBottom: 20,
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  progressBadgeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBadgeEmoji: {
    fontSize: 24,
    marginRight: 10,
  },
  progressBadgeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  progressBarContainer: {
    marginBottom: 10,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4F46E5',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 5,
  },
  progressRemaining: {
    fontSize: 12,
    color: '#F59E0B',
    textAlign: 'center',
    fontWeight: '600',
  },
  userInfoSection: {
    marginBottom: 20,
  },
  userInfoCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userInfoItem: {
    alignItems: 'center',
    flex: 1,
  },
  userInfoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 5,
    marginBottom: 2,
  },
  userInfoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 5,
  },
  footerCredit: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default HomeScreen;