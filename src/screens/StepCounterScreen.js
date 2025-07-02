import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSteps } from '../context/StepContext';
import { useAuth } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

const StepCounterScreen = () => {
  const { userProfile } = useAuth();
  const {
    dailySteps,
    todaySteps,
    isTracking,
    startStepTracking,
    stopStepTracking,
    saveStepsToFirestore,
    formatNumber,
    getDailyProgress,
    stepGoal,
    getNextBadge,
    badgeDefinitions,
    badges,
    getWeeklyAverage,
  } = useSteps();
  
  const [sessionSteps, setSessionSteps] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [trackingInterval, setTrackingInterval] = useState(null);
  const [sessionDuration, setSessionDuration] = useState(0);

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

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
  }, []);

  useEffect(() => {
    if (isTracking) {
      // Start pulse animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );

      // Start rotation animation
      const rotationAnimation = Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      );

      pulseAnimation.start();
      rotationAnimation.start();

      return () => {
        pulseAnimation.stop();
        rotationAnimation.stop();
      };
    } else {
      pulseAnim.setValue(1);
      rotateAnim.setValue(0);
    }
  }, [isTracking]);

  useEffect(() => {
    let durationInterval;
    if (isTracking && sessionStartTime) {
      durationInterval = setInterval(() => {
        const now = new Date();
        const duration = Math.floor((now - sessionStartTime) / 1000);
        setSessionDuration(duration);
      }, 1000);
    }

    return () => {
      if (durationInterval) {
        clearInterval(durationInterval);
      }
    };
  }, [isTracking, sessionStartTime]);

  const handleStartTracking = async () => {
    try {
      const interval = await startStepTracking();
      setTrackingInterval(interval);
      setSessionStartTime(new Date());
      setSessionSteps(dailySteps); // Set initial session steps to current daily steps
      setSessionDuration(0);

      // Scale animation for start
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      Alert.alert(
        '🚀 Adım Sayma Başladı!',
        'Artık adımların sayılıyor. Yürümeye başla ve hedefine ulaş!',
        [{ text: 'Tamam', style: 'default' }]
      );
    } catch (error) {
      Alert.alert('Hata', 'Adım sayma başlatılamadı. Lütfen tekrar deneyin.');
    }
  };

  const handleStopTracking = async () => {
    stopStepTracking();
    if (trackingInterval) {
      clearInterval(trackingInterval);
      setTrackingInterval(null);
    }

    // Calculate session steps
    const sessionStepsCount = dailySteps - sessionSteps;

    // Save session data
    if (sessionStepsCount > 0) {
      await saveStepsToFirestore();
      Alert.alert(
        '✅ Oturum Tamamlandı!',
        `Bu oturumda ${formatNumber(sessionStepsCount)} adım attın!\n\nSüre: ${formatDuration(sessionDuration)}\nHarika iş! 🎉`,
        [{ text: 'Tamam', style: 'default' }]
      );
    } else {
      Alert.alert(
        '⏸️ Oturum Durduruldu',
        'Oturum durduruldu. Hareket etmeye devam et!',
        [{ text: 'Tamam', style: 'default' }]
      );
    }

    setSessionStartTime(null);
    setSessionSteps(0);
    setSessionDuration(0);

    // Scale animation for stop
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}s ${minutes}d ${secs}sn`;
    } else if (minutes > 0) {
      return `${minutes}d ${secs}sn`;
    } else {
      return `${secs}sn`;
    }
  };

  const getSessionStepsCount = () => {
    if (!sessionStartTime) return 0;
    return Math.max(dailySteps - sessionSteps, 0);
  };

  const getMotivationalMessage = () => {
    const progress = getDailyProgress();
    const nextBadge = getNextBadge();
    
    if (progress >= 100) {
      return 'Günlük hedefini tamamladın! 🎉';
    } else if (nextBadge) {
      const remaining = nextBadge.steps - (todaySteps);
      if (remaining <= 100) {
        return `${nextBadge.emoji} ${remaining} adım kaldı!`;
      }
    }
    
    const messages = [
      'Her adım bir zafer! 🏆',
      'Sen harikasın! 💪',
      'Devam et, başarıyorsun! 🌟',
      'Hedefe doğru ilerliyorsun! 🎯',
      'Süpersin! 🔥',
      'İyi gidiyorsun! 👏',
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#4F46E5', '#7C3AED', '#EC4899']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Adım Sayıcı</Text>
            <Text style={styles.subtitle}>by rumet</Text>
          </View>

          {/* Main Step Counter */}
          <View style={styles.counterContainer}>
            <Animated.View
              style={[
                styles.counterCircle,
                {
                  transform: [
                    { scale: pulseAnim },
                    { rotate },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
                style={styles.circleGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons 
                  name="footsteps" 
                  size={60} 
                  color="white" 
                  style={{ opacity: isTracking ? 1 : 0.5 }}
                />
                <Text style={styles.stepCount}>{formatNumber(dailySteps)}</Text>
                <Text style={styles.stepLabel}>Bugünkü Adım</Text>
                
                {/* Daily Progress Ring */}
                <View style={styles.progressRing}>
                  <Text style={styles.progressText}>{Math.round(getDailyProgress())}%</Text>
                </View>
              </LinearGradient>
            </Animated.View>
          </View>

          {/* Session Info */}
          {isTracking && (
            <Animated.View style={styles.sessionInfo}>
              <View style={styles.sessionCard}>
                <Text style={styles.sessionTitle}>🔥 Aktif Oturum</Text>
                <View style={styles.sessionStats}>
                  <View style={styles.sessionStat}>
                    <Text style={styles.sessionStatValue}>{formatNumber(getSessionStepsCount())}</Text>
                    <Text style={styles.sessionStatLabel}>Bu Oturum</Text>
                  </View>
                  <View style={styles.sessionStat}>
                    <Text style={styles.sessionStatValue}>{formatDuration(sessionDuration)}</Text>
                    <Text style={styles.sessionStatLabel}>Süre</Text>
                  </View>
                </View>
                <Text style={styles.motivationText}>{getMotivationalMessage()}</Text>
              </View>
            </Animated.View>
          )}

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)']}
                style={styles.statCardGradient}
              >
                <Ionicons name="target-outline" size={24} color="white" />
                <Text style={styles.statValue}>{formatNumber(stepGoal)}</Text>
                <Text style={styles.statLabel}>Günlük Hedef</Text>
                <View style={styles.progressIndicator}>
                  <View style={[styles.progressBar, { width: `${Math.min(getDailyProgress(), 100)}%` }]} />
                </View>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)']}
                style={styles.statCardGradient}
              >
                <Ionicons name="trending-up-outline" size={24} color="white" />
                <Text style={styles.statValue}>{formatNumber(getWeeklyAverage())}</Text>
                <Text style={styles.statLabel}>Haftalık Ort.</Text>
              </LinearGradient>
            </View>

            <View style={styles.statCard}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)']}
                style={styles.statCardGradient}
              >
                <Ionicons name="ribbon-outline" size={24} color="white" />
                <Text style={styles.statValue}>{badges.length}</Text>
                <Text style={styles.statLabel}>Rozetler</Text>
              </LinearGradient>
            </View>
          </View>

          {/* Control Button */}
          <Animated.View
            style={[
              styles.buttonContainer,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <TouchableOpacity
              style={styles.controlButton}
              onPress={isTracking ? handleStopTracking : handleStartTracking}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={
                  isTracking
                    ? ['#EF4444', '#DC2626']
                    : ['#10B981', '#059669']
                }
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons
                  name={isTracking ? 'stop' : 'play'}
                  size={32}
                  color="white"
                />
                <Text style={styles.buttonText}>
                  {isTracking ? 'Durdur' : 'Başla'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Tips */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>💡 İpuçları</Text>
            <Text style={styles.tipsText}>
              • {getDailyProgress() < 50 ? 'Günün ilk yarısında aktif ol!' : 'Harika gidiyorsun, devam et!'}{'\n'}
              • Düzenli ara verme ve su içmeyi unutma{'\n'}
              • Arkadaşlarınla yarış ve liderlik tablosunda yerini al!{'\n'}
              • {getNextBadge() ? `${getNextBadge().emoji} ${getNextBadge().name} rozetine çok yakınsın!` : 'Tüm rozetleri topladın, tebrikler! 🎉'}
            </Text>
          </View>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    fontStyle: 'italic',
  },
  counterContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  counterCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 110,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  stepCount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  stepLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 5,
  },
  sessionInfo: {
    marginBottom: 20,
  },
  sessionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
  },
  sessionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  sessionStat: {
    alignItems: 'center',
  },
  sessionStatValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  sessionStatLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  motivationText: {
    fontSize: 16,
    color: '#FFD700',
    textAlign: 'center',
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 15,
    overflow: 'hidden',
  },
  statCardGradient: {
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  controlButton: {
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    paddingHorizontal: 40,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
  tipsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
  },
  tipsText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
  progressRing: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  progressIndicator: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 2,
  },
});

export default StepCounterScreen;