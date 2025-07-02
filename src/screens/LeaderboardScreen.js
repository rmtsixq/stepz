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
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useSteps } from '../context/StepContext';

const { width, height } = Dimensions.get('window');

const LeaderboardScreen = () => {
  const { userProfile } = useAuth();
  const { formatNumber, leaderboards, loadLeaderboards } = useSteps();
  const [activeTab, setActiveTab] = useState('individual');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const tabIndicatorAnim = useRef(new Animated.Value(0)).current;

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

    // Load leaderboard data
    loadLeaderboardData();
  }, []);

  const loadLeaderboardData = async () => {
    setLoading(true);
    try {
      await loadLeaderboards();
    } catch (error) {
      console.error('Error loading leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboardData();
    setRefreshing(false);
  };

  const handleTabPress = (tab) => {
    setActiveTab(tab);
    
    // Animate tab indicator
    const tabIndex = ['individual', 'class', 'grade'].indexOf(tab);
    Animated.timing(tabIndicatorAnim, {
      toValue: tabIndex,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return '#6B7280'; // Gray
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return '👑';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return rank.toString();
    }
  };

  const isCurrentUser = (item) => {
    if (activeTab === 'individual') {
      return item.uid === userProfile?.uid;
    } else if (activeTab === 'class') {
      return item.className === userProfile?.class;
    } else if (activeTab === 'grade') {
      return item.grade === userProfile?.grade;
    }
    return false;
  };

  const renderIndividualItem = (item, index) => (
    <Animated.View
      key={item.id || item.uid}
      style={[
        styles.leaderboardItem,
        isCurrentUser(item) && styles.currentUserItem,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateX: slideAnim.interpolate({
                inputRange: [0, 30],
                outputRange: [0, 30],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.rankContainer}>
        <View style={[styles.rankBadge, { backgroundColor: getRankColor(item.rank) }]}>
          <Text style={styles.rankText}>{getRankIcon(item.rank)}</Text>
        </View>
      </View>
      
      <View style={styles.playerInfo}>
        <Text style={[styles.playerName, isCurrentUser(item) && styles.currentUserText]}>
          {item.name || 'Anonim Kullanıcı'}
        </Text>
        <Text style={styles.playerClass}>{item.class || 'Sınıf Belirtilmemiş'}</Text>
      </View>
      
      <View style={styles.stepsInfo}>
        <Text style={[styles.stepsCount, isCurrentUser(item) && styles.currentUserText]}>
          {formatNumber(item.totalSteps || 0)}
        </Text>
        <Text style={styles.stepsLabel}>adım</Text>
      </View>
      
      {isCurrentUser(item) && (
        <View style={styles.currentUserBadge}>
          <Ionicons name="person" size={16} color="#4F46E5" />
        </View>
      )}
    </Animated.View>
  );

  const renderClassItem = (item, index) => (
    <Animated.View
      key={item.className}
      style={[
        styles.leaderboardItem,
        isCurrentUser(item) && styles.currentUserItem,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateX: slideAnim.interpolate({
                inputRange: [0, 30],
                outputRange: [0, 30],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.rankContainer}>
        <View style={[styles.rankBadge, { backgroundColor: getRankColor(item.rank) }]}>
          <Text style={styles.rankText}>{getRankIcon(item.rank)}</Text>
        </View>
      </View>
      
      <View style={styles.playerInfo}>
        <Text style={[styles.playerName, isCurrentUser(item) && styles.currentUserText]}>
          {item.className}
        </Text>
        <Text style={styles.playerClass}>{item.studentCount} öğrenci</Text>
      </View>
      
      <View style={styles.stepsInfo}>
        <Text style={[styles.stepsCount, isCurrentUser(item) && styles.currentUserText]}>
          {formatNumber(item.avgSteps)}
        </Text>
        <Text style={styles.stepsLabel}>ort. adım</Text>
      </View>
      
      {isCurrentUser(item) && (
        <View style={styles.currentUserBadge}>
          <Ionicons name="school" size={16} color="#4F46E5" />
        </View>
      )}
    </Animated.View>
  );

  const renderGradeItem = (item, index) => (
    <Animated.View
      key={item.grade}
      style={[
        styles.leaderboardItem,
        isCurrentUser(item) && styles.currentUserItem,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateX: slideAnim.interpolate({
                inputRange: [0, 30],
                outputRange: [0, 30],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.rankContainer}>
        <View style={[styles.rankBadge, { backgroundColor: getRankColor(item.rank) }]}>
          <Text style={styles.rankText}>{getRankIcon(item.rank)}</Text>
        </View>
      </View>
      
      <View style={styles.playerInfo}>
        <Text style={[styles.playerName, isCurrentUser(item) && styles.currentUserText]}>
          {item.grade}. Sınıf
        </Text>
        <Text style={styles.playerClass}>{item.studentCount} öğrenci</Text>
      </View>
      
      <View style={styles.stepsInfo}>
        <Text style={[styles.stepsCount, isCurrentUser(item) && styles.currentUserText]}>
          {formatNumber(item.avgSteps)}
        </Text>
        <Text style={styles.stepsLabel}>ort. adım</Text>
      </View>
      
      {isCurrentUser(item) && (
        <View style={styles.currentUserBadge}>
          <Ionicons name="library" size={16} color="#4F46E5" />
        </View>
      )}
    </Animated.View>
  );

  const renderContent = () => {
    const currentData = leaderboards[activeTab] || [];
    
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Liderlik tablosu yükleniyor...</Text>
        </View>
      );
    }

    if (currentData.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="trophy-outline" size={64} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>Henüz veri yok</Text>
          <Text style={styles.emptyText}>
            {activeTab === 'individual' && 'Henüz hiçbir kullanıcı adım atmamış.'}
            {activeTab === 'class' && 'Henüz sınıf verileri mevcut değil.'}
            {activeTab === 'grade' && 'Henüz seviye verileri mevcut değil.'}
          </Text>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Text style={styles.refreshButtonText}>Yenile</Text>
          </TouchableOpacity>
        </View>
      );
    }

    switch (activeTab) {
      case 'individual':
        return currentData.map(renderIndividualItem);
      case 'class':
        return currentData.map(renderClassItem);
      case 'grade':
        return currentData.map(renderGradeItem);
      default:
        return null;
    }
  };

  const getCurrentUserRank = () => {
    const currentData = leaderboards[activeTab] || [];
    
    if (activeTab === 'individual') {
      const userEntry = currentData.find(item => item.uid === userProfile?.uid);
      return userEntry ? userEntry.rank : null;
    } else if (activeTab === 'class') {
      const classEntry = currentData.find(item => item.className === userProfile?.class);
      return classEntry ? classEntry.rank : null;
    } else if (activeTab === 'grade') {
      const gradeEntry = currentData.find(item => item.grade === userProfile?.grade);
      return gradeEntry ? gradeEntry.rank : null;
    }
    
    return null;
  };

  const tabIndicatorTranslateX = tabIndicatorAnim.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, width / 3, (width * 2) / 3],
  });

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
          <Text style={styles.title}>Liderlik Tablosu</Text>
          <Text style={styles.subtitle}>Sıralamada yerini gör! - by rumet</Text>
          
          {/* Current User Rank Display */}
          {getCurrentUserRank() && (
            <View style={styles.userRankContainer}>
              <Text style={styles.userRankText}>
                Senin sıran: #{getCurrentUserRank()}
              </Text>
            </View>
          )}
        </Animated.View>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => handleTabPress('individual')}
          >
            <Ionicons
              name="person"
              size={20}
              color={activeTab === 'individual' ? '#4F46E5' : '#6B7280'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'individual' && styles.activeTabText,
              ]}
            >
              Bireysel
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tab}
            onPress={() => handleTabPress('class')}
          >
            <Ionicons
              name="school"
              size={20}
              color={activeTab === 'class' ? '#4F46E5' : '#6B7280'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'class' && styles.activeTabText,
              ]}
            >
              Sınıf
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tab}
            onPress={() => handleTabPress('grade')}
          >
            <Ionicons
              name="library"
              size={20}
              color={activeTab === 'grade' ? '#4F46E5' : '#6B7280'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'grade' && styles.activeTabText,
              ]}
            >
              Seviye
            </Text>
          </TouchableOpacity>
        </View>

        <Animated.View
          style={[
            styles.tabIndicator,
            {
              transform: [{ translateX: tabIndicatorTranslateX }],
            },
          ]}
        />
      </View>

      {/* Content */}
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
        <View style={styles.leaderboardContainer}>
          {renderContent()}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🏆 Adım at, sıralamada yüksel!
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
    marginBottom: 10,
  },
  userRankContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
  },
  userRankText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tabContainer: {
    backgroundColor: 'white',
    marginTop: -10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabBar: {
    flexDirection: 'row',
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 15,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 5,
  },
  activeTabText: {
    color: '#4F46E5',
  },
  tabIndicator: {
    height: 3,
    backgroundColor: '#4F46E5',
    width: width / 3 - 20,
    marginHorizontal: 10,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    backgroundColor: 'white',
  },
  leaderboardContainer: {
    padding: 20,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    position: 'relative',
  },
  currentUserItem: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
    borderWidth: 2,
  },
  rankContainer: {
    marginRight: 15,
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  playerInfo: {
    flex: 1,
    marginRight: 10,
  },
  playerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  playerClass: {
    fontSize: 12,
    color: '#6B7280',
  },
  stepsInfo: {
    alignItems: 'flex-end',
  },
  stepsCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  stepsLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 2,
  },
  currentUserText: {
    color: '#4F46E5',
  },
  currentUserBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
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
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  refreshButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  refreshButtonText: {
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
});

export default LeaderboardScreen;