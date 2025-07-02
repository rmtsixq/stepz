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

const LeaderboardScreen = () => {
  const { userProfile } = useAuth();
  const { formatNumber } = useSteps();
  const [activeTab, setActiveTab] = useState('individual');
  const [refreshing, setRefreshing] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState({
    individual: [],
    class: [],
    grade: [],
  });

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

  const loadLeaderboardData = () => {
    // Simulate leaderboard data - In real app, fetch from Firebase
    const mockIndividualData = [
      { id: '1', name: 'Ahmet Kaya', class: '10A', totalSteps: 45230, rank: 1 },
      { id: '2', name: 'Zeynep Demir', class: '9B', totalSteps: 42150, rank: 2 },
      { id: '3', name: 'Mehmet Öz', class: '11C', totalSteps: 39840, rank: 3 },
      { id: '4', name: 'Ayşe Yılmaz', class: '10B', totalSteps: 37920, rank: 4 },
      { id: '5', name: 'Can Arslan', class: '9A', totalSteps: 35600, rank: 5 },
      { id: '6', name: userProfile?.name || 'Sen', class: userProfile?.class || '9A', totalSteps: 25000, rank: 8 },
    ];

    const mockClassData = [
      { id: '1', className: '10A', avgSteps: 38500, studentCount: 28, rank: 1 },
      { id: '2', className: '9B', avgSteps: 36200, studentCount: 30, rank: 2 },
      { id: '3', className: '11C', avgSteps: 34800, studentCount: 25, rank: 3 },
      { id: '4', className: '10B', avgSteps: 33100, studentCount: 27, rank: 4 },
      { id: '5', className: userProfile?.class || '9A', avgSteps: 31500, studentCount: 29, rank: 5 },
    ];

    const mockGradeData = [
      { id: '1', grade: '10', avgSteps: 35800, classCount: 4, rank: 1 },
      { id: '2', grade: '11', avgSteps: 34200, classCount: 3, rank: 2 },
      { id: '3', grade: '9', avgSteps: 32900, classCount: 5, rank: 3 },
      { id: '4', grade: '12', avgSteps: 30100, classCount: 2, rank: 4 },
    ];

    setLeaderboardData({
      individual: mockIndividualData,
      class: mockClassData,
      grade: mockGradeData,
    });
  };

  const onRefresh = async () => {
    setRefreshing(true);
    loadLeaderboardData();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
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
      return item.name === userProfile?.name;
    } else if (activeTab === 'class') {
      return item.className === userProfile?.class;
    } else if (activeTab === 'grade') {
      return item.grade === userProfile?.grade;
    }
    return false;
  };

  const renderIndividualItem = (item, index) => (
    <Animated.View
      key={item.id}
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
          {item.name}
        </Text>
        <Text style={styles.playerClass}>{item.class}</Text>
      </View>
      
      <View style={styles.stepsInfo}>
        <Text style={[styles.stepsCount, isCurrentUser(item) && styles.currentUserText]}>
          {formatNumber(item.totalSteps)}
        </Text>
        <Text style={styles.stepsLabel}>adım</Text>
      </View>
    </Animated.View>
  );

  const renderClassItem = (item, index) => (
    <Animated.View
      key={item.id}
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
    </Animated.View>
  );

  const renderGradeItem = (item, index) => (
    <Animated.View
      key={item.id}
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
        <Text style={styles.playerClass}>{item.classCount} sınıf</Text>
      </View>
      
      <View style={styles.stepsInfo}>
        <Text style={[styles.stepsCount, isCurrentUser(item) && styles.currentUserText]}>
          {formatNumber(item.avgSteps)}
        </Text>
        <Text style={styles.stepsLabel}>ort. adım</Text>
      </View>
    </Animated.View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'individual':
        return leaderboardData.individual.map(renderIndividualItem);
      case 'class':
        return leaderboardData.class.map(renderClassItem);
      case 'grade':
        return leaderboardData.grade.map(renderGradeItem);
      default:
        return null;
    }
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  playerInfo: {
    flex: 1,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  stepsLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  currentUserText: {
    color: '#4F46E5',
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

export default LeaderboardScreen;