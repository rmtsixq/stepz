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
  ActivityIndicator,
  Modal,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useSteps } from '../context/StepContext';

const { width, height } = Dimensions.get('window');

const EventsScreen = () => {
  const { userProfile } = useAuth();
  const { formatNumber, events, createEvent, deleteEvent } = useSteps();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeEvents, setActiveEvents] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    multiplier: '',
    target: '',
    type: 'bonus'
  });

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

    loadEventsData();
  }, []);

  useEffect(() => {
    // Update active events when events change
    const now = new Date();
    const active = events.filter(event => {
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      return now >= start && now <= end && event.isActive;
    });
    setActiveEvents(active);
    setLoading(false);
  }, [events]);

  const loadEventsData = async () => {
    setLoading(true);
    // Events are automatically loaded via StepContext useEffect
    // Just wait a moment for the data to load
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEventsData();
    setRefreshing(false);
  };

  const isAdmin = () => {
    // Simple admin check - in real app, this would be more sophisticated
    return userProfile?.email?.includes('admin') || userProfile?.email?.includes('teacher');
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.description || !newEvent.startDate || !newEvent.endDate) {
      Alert.alert('Hata', 'Lütfen tüm gerekli alanları doldurun.');
      return;
    }

    try {
      const eventData = {
        title: newEvent.title,
        description: newEvent.description,
        startDate: newEvent.startDate,
        endDate: newEvent.endDate,
        type: newEvent.type,
        isActive: true,
        participants: 0,
        createdBy: userProfile.uid,
        createdByName: userProfile.name
      };

      if (newEvent.multiplier) {
        eventData.multiplier = parseFloat(newEvent.multiplier);
      }

      if (newEvent.target) {
        eventData.target = parseInt(newEvent.target);
      }

      await createEvent(eventData);
      
      setShowCreateModal(false);
      setNewEvent({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        multiplier: '',
        target: '',
        type: 'bonus'
      });

      Alert.alert('✅ Başarılı!', 'Etkinlik başarıyla oluşturuldu!');
    } catch (error) {
      Alert.alert('Hata', 'Etkinlik oluşturulurken bir hata oluştu.');
    }
  };

  const handleDeleteEvent = (eventId, eventTitle) => {
    Alert.alert(
      'Etkinliği Sil',
      `"${eventTitle}" etkinliğini silmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteEvent(eventId);
              Alert.alert('✅ Başarılı!', 'Etkinlik silindi.');
            } catch (error) {
              Alert.alert('Hata', 'Etkinlik silinirken bir hata oluştu.');
            }
          }
        }
      ]
    );
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
            // In real app, this would update user's joined events in Firebase
            Alert.alert('✅ Başarılı!', `${event.title} etkinliğine katıldın! Bol şans!`);
          }
        }
      ]
    );
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    
    if (now < start) {
      return { text: 'Yakında', color: '#FFA726' };
    } else if (now > end) {
      return { text: 'Tamamlandı', color: '#9E9E9E' };
    } else {
      return { text: 'Aktif', color: '#4CAF50' };
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTimeRemaining = (endDateString) => {
    const now = new Date();
    const endDate = new Date(endDateString);
    const diff = endDate - now;
    
    if (diff <= 0) return 'Sona erdi';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} gün kaldı`;
    return `${hours} saat kaldı`;
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'bonus':
        return ['#FF6B6B', '#FF8E8E'];
      case 'challenge':
        return ['#4ECDC4', '#44A08D'];
      case 'competition':
        return ['#FFA726', '#FFB74D'];
      case 'weather':
        return ['#9C27B0', '#BA68C8'];
      default:
        return ['#4F46E5', '#7C3AED'];
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'bonus':
        return '🎁';
      case 'challenge':
        return '🎯';
      case 'competition':
        return '🏆';
      case 'weather':
        return '☔';
      default:
        return '⭐';
    }
  };

  const renderEventCard = (event, index) => {
    const status = getEventStatus(event);
    const colors = getEventColor(event.type);
    const icon = getEventIcon(event.type);
    
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
          colors={colors}
          style={styles.eventCardGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.eventHeader}>
            <View style={styles.eventIcon}>
              <Text style={styles.eventIconText}>{icon}</Text>
            </View>
            <View style={styles.eventStatus}>
              <Text style={[styles.statusText, { color: status.color }]}>
                {status.text}
              </Text>
            </View>
            {isAdmin() && (
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteEvent(event.id, event.title)}
              >
                <Ionicons name="trash-outline" size={20} color="white" />
              </TouchableOpacity>
            )}
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
                {event.participants || 0} katılımcı
              </Text>
            </View>

            {status.text === 'Aktif' && (
              <View style={styles.eventDetail}>
                <Ionicons name="time-outline" size={16} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.detailText}>
                  {getTimeRemaining(event.endDate)}
                </Text>
              </View>
            )}

            {event.createdByName && (
              <View style={styles.eventDetail}>
                <Ionicons name="person-outline" size={16} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.detailText}>
                  Oluşturan: {event.createdByName}
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

          {status.text === 'Aktif' && (
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

  const renderCreateEventModal = () => (
    <Modal
      visible={showCreateModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowCreateModal(false)}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Yeni Etkinlik Oluştur</Text>
          <TouchableOpacity onPress={handleCreateEvent}>
            <Text style={styles.saveButton}>Kaydet</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Etkinlik Başlığı *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Örn: Haftasonu Canavarı"
              value={newEvent.title}
              onChangeText={(text) => setNewEvent({...newEvent, title: text})}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Açıklama *</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="Etkinlik açıklamasını yazın..."
              value={newEvent.description}
              onChangeText={(text) => setNewEvent({...newEvent, description: text})}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.rowInputs}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Başlangıç Tarihi *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD"
                value={newEvent.startDate}
                onChangeText={(text) => setNewEvent({...newEvent, startDate: text})}
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Bitiş Tarihi *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD"
                value={newEvent.endDate}
                onChangeText={(text) => setNewEvent({...newEvent, endDate: text})}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Etkinlik Türü</Text>
            <View style={styles.typeSelector}>
              {['bonus', 'challenge', 'competition', 'weather'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeOption,
                    newEvent.type === type && styles.typeOptionSelected
                  ]}
                  onPress={() => setNewEvent({...newEvent, type})}
                >
                  <Text style={[
                    styles.typeOptionText,
                    newEvent.type === type && styles.typeOptionTextSelected
                  ]}>
                    {type === 'bonus' && '🎁 Bonus'}
                    {type === 'challenge' && '🎯 Meydan Okuma'}
                    {type === 'competition' && '🏆 Yarışma'}
                    {type === 'weather' && '☔ Hava Durumu'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.rowInputs}>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Bonus Çarpanı</Text>
              <TextInput
                style={styles.textInput}
                placeholder="1.5"
                value={newEvent.multiplier}
                onChangeText={(text) => setNewEvent({...newEvent, multiplier: text})}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.halfInput}>
              <Text style={styles.inputLabel}>Hedef Adım</Text>
              <TextInput
                style={styles.textInput}
                placeholder="10000"
                value={newEvent.target}
                onChangeText={(text) => setNewEvent({...newEvent, target: text})}
                keyboardType="numeric"
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

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
          
          {isAdmin() && (
            <TouchableOpacity
              style={styles.createEventButton}
              onPress={() => setShowCreateModal(true)}
            >
              <Ionicons name="add" size={20} color="white" />
              <Text style={styles.createEventButtonText}>Etkinlik Oluştur</Text>
            </TouchableOpacity>
          )}
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.loadingText}>Etkinlikler yükleniyor...</Text>
          </View>
        ) : (
          <>
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
              {events.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="calendar-outline" size={64} color="#9CA3AF" />
                  <Text style={styles.emptyTitle}>Henüz etkinlik yok</Text>
                  <Text style={styles.emptyText}>
                    Henüz hiç etkinlik oluşturulmamış. {isAdmin() ? 'İlk etkinliği siz oluşturabilirsiniz!' : 'Yakında etkinlikler eklenecek.'}
                  </Text>
                </View>
              ) : (
                events.map(renderEventCard)
              )}
            </View>

            {/* Create Event Suggestion for non-admins */}
            {!isAdmin() && (
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
            )}

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                🎉 Etkinliklere katıl, daha çok eğlen!
              </Text>
              <Text style={styles.footerCredit}>Made with ❤️ by RUMET ASAN</Text>
            </View>
          </>
        )}
      </ScrollView>

      {renderCreateEventModal()}
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
    marginBottom: 15,
  },
  createEventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  createEventButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  content: {
    flex: 1,
    marginTop: -10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#6B7280',
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 40,
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
  deleteButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 20,
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
    marginBottom: 15,
  },
  suggestButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  suggestButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
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
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  halfInput: {
    flex: 0.48,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeOption: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  typeOptionSelected: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  typeOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  typeOptionTextSelected: {
    color: 'white',
  },
});

export default EventsScreen;