import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useSteps } from '../context/StepContext';

const { width, height } = Dimensions.get('window');

const ProfileScreen = () => {
  const { userProfile, logout } = useAuth();
  const { getTotalSteps, badges, badgeDefinitions, formatNumber } = useSteps();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

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
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabından çıkmak istediğin emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const getUserLevel = () => {
    const totalSteps = getTotalSteps();
    if (totalSteps >= 50000) return { level: 'Efsane', color: '#9B59B6', icon: '👑' };
    if (totalSteps >= 20000) return { level: 'Uzman', color: '#E74C3C', icon: '🔥' };
    if (totalSteps >= 10000) return { level: 'İleri', color: '#F39C12', icon: '⭐' };
    if (totalSteps >= 5000) return { level: 'Orta', color: '#3498DB', icon: '🎯' };
    if (totalSteps >= 1000) return { level: 'Başlangıç', color: '#2ECC71', icon: '🌱' };
    return { level: 'Yeni', color: '#95A5A6', icon: '👶' };
  };

  const getJoinedDays = () => {
    if (!userProfile?.joinDate) return 0;
    const joinDate = new Date(userProfile.joinDate);
    const today = new Date();
    const diffTime = Math.abs(today - joinDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getAverageSteps = () => {
    const joinedDays = getJoinedDays();
    if (joinedDays === 0) return 0;
    return Math.round(getTotalSteps() / joinedDays);
  };

  const earnedBadges = badgeDefinitions.filter(badge => badges.includes(badge.id));
  const userLevel = getUserLevel();

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
          {/* Profile Avatar */}
          <Animated.View
            style={[
              styles.avatarContainer,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.1)']}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>
                {userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </LinearGradient>
            <View style={[styles.levelBadge, { backgroundColor: userLevel.color }]}>
              <Text style={styles.levelIcon}>{userLevel.icon}</Text>
            </View>
          </Animated.View>

          {/* User Info */}
          <Text style={styles.userName}>{userProfile?.name || 'Kullanıcı'}</Text>
          <Text style={styles.userEmail}>{userProfile?.email || ''}</Text>
          <View style={styles.userLevel}>
            <Text style={styles.userLevelText}>
              {userLevel.level} Seviye
            </Text>
          </View>
        </Animated.View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.statsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Quick Stats */}
          <View style={styles.quickStatsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{formatNumber(getTotalSteps())}</Text>
              <Text style={styles.statLabel}>Toplam Adım</Text>
              <Ionicons name="footsteps" size={24} color="#4F46E5" />
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{earnedBadges.length}</Text>
              <Text style={styles.statLabel}>Kazanılan Rozet</Text>
              <Ionicons name="trophy" size={24} color="#F59E0B" />
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{getJoinedDays()}</Text>
              <Text style={styles.statLabel}>Aktif Gün</Text>
              <Ionicons name="calendar" size={24} color="#10B981" />
            </View>
          </View>

          {/* Detailed Stats */}
          <View style={styles.detailedStats}>
            <Text style={styles.sectionTitle}>📊 İstatistikler</Text>
            
            <View style={styles.detailStatItem}>
              <View style={styles.detailStatLeft}>
                <Ionicons name="trending-up" size={20} color="#4F46E5" />
                <Text style={styles.detailStatLabel}>Günlük Ortalama</Text>
              </View>
              <Text style={styles.detailStatValue}>{formatNumber(getAverageSteps())} adım</Text>
            </View>

            <View style={styles.detailStatItem}>
              <View style={styles.detailStatLeft}>
                <Ionicons name="school" size={20} color="#7C3AED" />
                <Text style={styles.detailStatLabel}>Sınıf</Text>
              </View>
              <Text style={styles.detailStatValue}>{userProfile?.class || '-'}</Text>
            </View>

            <View style={styles.detailStatItem}>
              <View style={styles.detailStatLeft}>
                <Ionicons name="library" size={20} color="#EC4899" />
                <Text style={styles.detailStatLabel}>Seviye</Text>
              </View>
              <Text style={styles.detailStatValue}>{userProfile?.grade || '-'}. Sınıf</Text>
            </View>

            <View style={styles.detailStatItem}>
              <View style={styles.detailStatLeft}>
                <Ionicons name="person" size={20} color="#F59E0B" />
                <Text style={styles.detailStatLabel}>Yaş</Text>
              </View>
              <Text style={styles.detailStatValue}>{userProfile?.age || '-'}</Text>
            </View>
          </View>

          {/* Badges Section */}
          <View style={styles.badgesSection}>
            <Text style={styles.sectionTitle}>🏆 Rozetlerim</Text>
            {earnedBadges.length > 0 ? (
              <View style={styles.badgesGrid}>
                {earnedBadges.map((badge) => (
                  <View key={badge.id} style={styles.badgeItem}>
                    <LinearGradient
                      colors={[badge.color, badge.color + '80']}
                      style={styles.badgeCircle}
                    >
                      <Text style={styles.badgeEmoji}>{badge.emoji}</Text>
                    </LinearGradient>
                    <Text style={styles.badgeName}>{badge.name}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.noBadgesContainer}>
                <Text style={styles.noBadgesText}>
                  Henüz rozet kazanmadın. Adım atmaya başla!
                </Text>
              </View>
            )}
          </View>

          {/* Settings Section */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>⚙️ Ayarlar</Text>
            
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="notifications-outline" size={20} color="#6B7280" />
                <Text style={styles.settingLabel}>Bildirimler</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="shield-outline" size={20} color="#6B7280" />
                <Text style={styles.settingLabel}>Gizlilik</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="help-circle-outline" size={20} color="#6B7280" />
                <Text style={styles.settingLabel}>Yardım & Destek</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <Ionicons name="information-circle-outline" size={20} color="#6B7280" />
                <Text style={styles.settingLabel}>Uygulama Hakkında</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          {/* App Info */}
          <View style={styles.appInfoSection}>
            <Text style={styles.appInfoTitle}>StepZ - Okul Adım Yarışması</Text>
            <Text style={styles.appInfoVersion}>Versiyon 1.0.0</Text>
            <Text style={styles.appInfoCredit}>
              Made with ❤️ by RUMET ASAN
            </Text>
            <Text style={styles.appInfoDescription}>
              Arkadaşlarınla yarış, adım at, sağlıklı kal!
            </Text>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LinearGradient
              colors={['#EF4444', '#DC2626']}
              style={styles.logoutButtonGradient}
            >
              <Ionicons name="log-out-outline" size={20} color="white" />
              <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
            </LinearGradient>
          </TouchableOpacity>
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
    paddingVertical: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    alignItems: 'center',
  },
  headerContent: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  levelBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  levelIcon: {
    fontSize: 14,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 10,
  },
  userLevel: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  userLevelText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    marginTop: -10,
  },
  statsContainer: {
    padding: 20,
  },
  quickStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 15,
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
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 10,
    textAlign: 'center',
  },
  detailedStats: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 15,
  },
  detailStatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailStatLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailStatLabel: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 10,
  },
  detailStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  badgesSection: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeItem: {
    alignItems: 'center',
    width: '22%',
    marginBottom: 15,
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
    fontSize: 10,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  noBadgesContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noBadgesText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  settingsSection: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
  },
  appInfoSection: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  appInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 5,
  },
  appInfoVersion: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 5,
  },
  appInfoCredit: {
    fontSize: 12,
    color: '#4F46E5',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  appInfoDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  logoutButton: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 30,
    elevation: 4,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  logoutButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
});

export default ProfileScreen;