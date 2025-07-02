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
import { useAuth } from '../context/AuthContext';
import { useSteps } from '../context/StepContext';

const { width, height } = Dimensions.get('window');

const EventsScreen = () => {
  const { userProfile } = useAuth();
  const { formatNumber } = useSteps();
  const [refreshing, setRefreshing] = useState(false);
  const [events, setEvents] = useState([]);
  const [activeEvents, setActiveEvents] = useState([]);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

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

    loadEvents();
  }, []);

  const loadEvents = () => {
    // Simulate events data - In real app, fetch from Firebase
    const mockEvents = [
      {
        id: '1',
        title: 'Haftasonu Canavarı 🦄',
        description: 'Bu hafta sonu %50 bonus puan kazan! Cumartesi ve Pazar günleri attığın her adım için ekstra puan al.',
        startDate: new Date('2024-01-20'),
        endDate: new Date('2024-01-21'),
        multiplier: 1.5,
        isActive: true,
        icon: '🦄',
        color: ['#FF6B6B', '#FF8E8E'],
        participants: 145,
        type: 'bonus'
      },
      {
        id: '2',
        title: '10K Adım Challenges 🎯',
        description: 'Günde 10.000 adıma ulaşan herkese özel rozet! Hedefine ulaş ve arkadaşlarınla paylaş.',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-30'),
        target: 10000,
        isActive: true,
        icon: '🎯',
        color: ['#4ECDC4', '#44A08D'],
        participants: 89,
        type: 'challenge'
      },
      {
        id: '3',
        title: 'Sınıflar Arası Mega Yarış 🏆',
        description: 'Hangi sınıf daha çok adım atar? 2 haftalık büyük yarışta sınıfını temsil et!',
        startDate: new Date('2024-01-22'),
        endDate: new Date('2024-02-05'),
        isActive: false,
        icon: '🏆',
        color: ['#FFA726', '#FFB74D'],
        participants: 234,
        type: 'competition'
      },
      {
        id: '4',
        title: 'Yağmurlu Gün Motivasyonu ☔',
        description: 'Yağmurlu günlerde bile hareket et! Kapalı havada attığın adımlar için %25 bonus.',
        startDate: new Date('2024-01-18'),
        endDate: new Date('2024-01-25'),
        multiplier: 1.25,
        isActive: true,
        icon: '☔',
        color: ['#9C27B0', '#BA68C8'],
        participants: 67,
        type: 'weather'
      }
    ];

    setEvents(mockEvents);
    setActiveEvents(mockEvents.filter(event => event.isActive));
  };

  const onRefresh = async () => {
    setRefreshing(true);
    loadEvents();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const joinEvent = (event) => {
    Alert.alert(
      '🎉 Etkinliğe Katıl!',
      `"${event.title}" etkinliğine katılmak istiyor musun?`,
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Katıl', 
          style: 'default',
          onPress: () => {
            Alert.alert('✅ Başarılı!', `${event.title} etkinliğine katıldın! Bol şans!`);
          }
        }
      ]
    );
  };

  const getEventStatus = (event) => {
    const now = new Date();
    if (now < event.startDate) {
      return { text: 'Yakında', color: '#FFA726' };
    } else if (now > event.endDate) {
      return { text: 'Tamamlandı', color: '#9E9E9E' };
    } else {
      return { text: 'Aktif', color: '#4CAF50' };
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTimeRemaining = (endDate) => {
    const now = new Date();
    const diff = endDate - now;
    
    if (diff <= 0) return 'Sona erdi';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} gün kaldı`;
    return `${hours} saat kaldı`;
  };

  const renderEventCard = (event, index) => {
    const status = getEventStatus(event);
    
    return (
      <Animated.View
        key={event.id}
        style={[
          styles.eventCard,
          {
            opacity: fadeAnim,
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 30],
                  outputRange: [0, 30 + index * 10],
                }),
              },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={event.color}
          style={styles.eventCardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.eventHeader}>
            <View style={styles.eventIcon}>
              <Text style={styles.eventIconText}>{event.icon}</Text>
            </View>
            <View style={styles.eventStatus}>
              <Text style={[styles.statusText, { color: status.color }]}>
                {status.text}
              </Text>
            </View>
          </View>

          <Text style={styles.eventTitle}>{event.title}</Text>
          <Text style={styles.eventDescription}>{event.description}</Text>

          <View style={styles.eventDetails}>
            <View style={styles.eventDetail}>
              <Ionicons name="calendar-outline" size={16} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.detailText}>
                {formatDate(event.startDate)} - {formatDate(event.endDate)}
              </Text>
            </View>

            <View style={styles.eventDetail}>
              <Ionicons name="people-outline" size={16} color="rgba(255, 255, 255, 0.8)" />
              <Text style={styles.detailText}>
                {event.participants} katılımcı
              </Text>
            </View>

            {event.isActive && (
              <View style={styles.eventDetail}>
                <Ionicons name="time-outline" size={16} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.detailText}>
                  {getTimeRemaining(event.endDate)}
                </Text>
              </View>
            )}
          </View>

          {event.multiplier && (
            <View style={styles.bonusContainer}>
              <Text style={styles.bonusText}>
                🎁 {((event.multiplier - 1) * 100).toFixed(0)}% Bonus Puan!
              </Text>
            </View>
          )}

          {event.target && (
            <View style={styles.targetContainer}>
              <Text style={styles.targetText}>
                🎯 Hedef: {formatNumber(event.target)} adım
              </Text>
            </View>
          )}

          {event.isActive && (
            <TouchableOpacity
              style={styles.joinButton}
              onPress={() => joinEvent(event)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
                style={styles.joinButtonGradient}
              >
                <Ionicons name="add-circle-outline" size={20} color="white" />
                <Text style={styles.joinButtonText}>Katıl</Text>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </LinearGradient>
      </Animated.View>
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
          <Text style={styles.title}>Etkinlikler</Text>
          <Text style={styles.subtitle}>Özel yarışmalar ve bonuslar - by rumet</Text>
        </Animated.View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Active Events Section */}
        {activeEvents.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔥 Aktif Etkinlikler</Text>
            {activeEvents.map(renderEventCard)}
          </View>
        )}

        {/* All Events Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Tüm Etkinlikler</Text>
          {events.map(renderEventCard)}
        </View>

        {/* Create Event Suggestion */}
        <View style={styles.createEventSection}>
          <LinearGradient
            colors={['#F3F4F6', '#E5E7EB']}
            style={styles.createEventCard}
          >
            <Text style={styles.createEventTitle}>💡 Etkinlik Önerisi</Text>
            <Text style={styles.createEventText}>
              Kendi etkinlik fikrin var mı? Öğretmenin veya okul yönetimine öner!
            </Text>
            <TouchableOpacity style={styles.suggestButton}>
              <Text style={styles.suggestButtonText}>Öneri Gönder</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🎉 Etkinliklere katıl, daha çok eğlen!
          </Text>
          <Text style={styles.footerCredit}>Made with ❤️ by RUMET ASAN</Text>
        </View>
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
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  content: {
    flex: 1,
    marginTop: -10,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  eventCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  eventCardGradient: {
    padding: 20,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  eventIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventIconText: {
    fontSize: 24,
  },
  eventStatus: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  eventDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    marginBottom: 15,
  },
  eventDetails: {
    marginBottom: 15,
  },
  eventDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 8,
  },
  bonusContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  bonusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  targetContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  targetText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  joinButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginTop: 5,
  },
  joinButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  createEventSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  createEventCard: {
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
  },
  createEventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
  },
  createEventText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 15,
  },
  suggestButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  suggestButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 5,
    textAlign: 'center',
  },
  footerCredit: {
    fontSize: 12,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
});

export default EventsScreen;