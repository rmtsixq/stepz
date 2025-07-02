import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, updateDoc, arrayUnion, collection, getDocs, addDoc, deleteDoc, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from './AuthContext';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';

const StepContext = createContext();

export const useSteps = () => {
  const context = useContext(StepContext);
  if (!context) {
    throw new Error('useSteps must be used within a StepProvider');
  }
  return context;
};

export const StepProvider = ({ children }) => {
  const { user, userProfile, fetchUserProfile } = useAuth();
  const [dailySteps, setDailySteps] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [todaySteps, setTodaySteps] = useState(0);
  const [weeklySteps, setWeeklySteps] = useState([]);
  const [badges, setBadges] = useState([]);
  const [leaderboards, setLeaderboards] = useState({
    individual: [],
    class: [],
    grade: []
  });
  const [events, setEvents] = useState([]);
  const [stepGoal, setStepGoal] = useState(10000); // Daily goal

  // Real-time step subscription
  const [subscription, setSubscription] = useState(null);

  // Badge definitions with proper progression
  const badgeDefinitions = [
    { id: 'first_steps', name: 'İlk Adımlar', emoji: '👶', steps: 100, color: '#E6F3FF' },
    { id: 'bronze', name: 'Bronz Yürüyüşçü', emoji: '🥉', steps: 1000, color: '#CD7F32' },
    { id: 'silver', name: 'Gümüş Koşucu', emoji: '🥈', steps: 5000, color: '#C0C0C0' },
    { id: 'gold', name: 'Altın Atlet', emoji: '🥇', steps: 10000, color: '#FFD700' },
    { id: 'diamond', name: 'Elmas Şampiyon', emoji: '🏅', steps: 20000, color: '#B9F2FF' },
    { id: 'legend', name: 'Efsane Yürüyüşçü', emoji: '👑', steps: 50000, color: '#9B59B6' },
    { id: 'ultimate', name: 'Ultimate Warrior', emoji: '🔥', steps: 100000, color: '#FF6B6B' },
  ];

  // Initialize pedometer and load data
  useEffect(() => {
    if (userProfile) {
      initializeStepTracking();
      loadTodaySteps();
      loadWeeklySteps();
      setBadges(userProfile.earnedBadges || []);
      loadLeaderboards();
      loadEvents();
    }

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [userProfile]);

  const initializeStepTracking = async () => {
    try {
      // Check if pedometer is available
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        console.log('Pedometer is not available on this device');
        return;
      }

      // Load last saved step count
      const today = new Date().toISOString().split('T')[0];
      const savedSteps = await AsyncStorage.getItem(`steps_${today}`);
      if (savedSteps) {
        setTodaySteps(parseInt(savedSteps));
        setDailySteps(parseInt(savedSteps));
      }

      // Get today's steps from pedometer
      const end = new Date();
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const result = await Pedometer.getStepCountAsync(start, end);
      if (result.steps > 0) {
        setTodaySteps(result.steps);
        setDailySteps(result.steps);
        await AsyncStorage.setItem(`steps_${today}`, result.steps.toString());
      }
    } catch (error) {
      console.error('Error initializing step tracking:', error);
    }
  };

  const startStepTracking = async () => {
    try {
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        // Fallback for devices without pedometer - simulate steps
        return startSimulatedTracking();
      }

      setIsTracking(true);

      // Subscribe to step counter updates
      const stepSubscription = Pedometer.watchStepCount(result => {
        const newSteps = result.steps;
        setDailySteps(newSteps);
        setTodaySteps(prev => prev + 1); // Increment for each new step
        
        // Save to AsyncStorage
        const today = new Date().toISOString().split('T')[0];
        AsyncStorage.setItem(`steps_${today}`, newSteps.toString());
        
        // Check for badges every 100 steps
        if (newSteps % 100 === 0) {
          checkForNewBadges(getTotalSteps() + newSteps);
        }
      });

      setSubscription(stepSubscription);
      return stepSubscription;
    } catch (error) {
      console.error('Error starting step tracking:', error);
      setIsTracking(false);
      return null;
    }
  };

  // Fallback simulation for devices without pedometer
  const startSimulatedTracking = () => {
    setIsTracking(true);
    
    const interval = setInterval(() => {
      setDailySteps(prev => {
        const increment = Math.floor(Math.random() * 3) + 1; // 1-3 steps per update
        const newSteps = prev + increment;
        setTodaySteps(prevToday => {
          const newTodaySteps = prevToday + increment;
          
          // Save to AsyncStorage
          const today = new Date().toISOString().split('T')[0];
          AsyncStorage.setItem(`steps_${today}`, newTodaySteps.toString());
          
          // Check for badges
          if (newTodaySteps % 50 === 0) {
            checkForNewBadges(getTotalSteps() + newTodaySteps);
          }
          
          return newTodaySteps;
        });
        return newSteps;
      });
    }, 2000); // Update every 2 seconds

    return interval;
  };

  const stopStepTracking = () => {
    setIsTracking(false);
    
    if (subscription) {
      subscription.remove();
      setSubscription(null);
    }
    
    // Save final step count to Firebase
    saveStepsToFirestore();
  };

  const loadTodaySteps = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Try to get from AsyncStorage first
      const savedSteps = await AsyncStorage.getItem(`steps_${today}`);
      if (savedSteps) {
        setTodaySteps(parseInt(savedSteps));
        return;
      }

      // Get from user profile
      if (userProfile?.stepsLog?.[today]) {
        setTodaySteps(userProfile.stepsLog[today]);
      }
    } catch (error) {
      console.error('Error loading today steps:', error);
    }
  };

  const loadWeeklySteps = () => {
    if (!userProfile?.stepsLog) return;

    const stepsLog = userProfile.stepsLog;
    const weeklyData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      weeklyData.push({
        date: dateStr,
        steps: stepsLog[dateStr] || 0,
        day: date.toLocaleDateString('tr-TR', { weekday: 'short' })
      });
    }
    
    setWeeklySteps(weeklyData);
  };

  const checkForNewBadges = async (totalSteps) => {
    if (!user || !userProfile) return;

    const earnedBadges = userProfile.earnedBadges || [];
    const newBadges = [];

    badgeDefinitions.forEach(badge => {
      if (totalSteps >= badge.steps && !earnedBadges.includes(badge.id)) {
        newBadges.push(badge.id);
      }
    });

    if (newBadges.length > 0) {
      try {
        // Update Firebase
        await updateDoc(doc(db, 'users', user.uid), {
          earnedBadges: arrayUnion(...newBadges)
        });

        // Update local state
        setBadges(prev => [...prev, ...newBadges]);

        // Send notifications for new badges
        newBadges.forEach(badgeId => {
          const badge = badgeDefinitions.find(b => b.id === badgeId);
          if (badge) {
            Notifications.scheduleNotificationAsync({
              content: {
                title: '🎉 Yeni Rozet Kazandın!',
                body: `${badge.emoji} ${badge.name} rozetini kazandın! by rumet`,
                data: { badgeId },
              },
              trigger: null,
            });
          }
        });

        // Refresh user profile
        await fetchUserProfile(user.uid);
      } catch (error) {
        console.error('Error updating badges:', error);
      }
    }
  };

  const saveStepsToFirestore = async (customSteps = null) => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const steps = customSteps || todaySteps;
      
      const updateData = {
        totalSteps: (userProfile?.totalSteps || 0) + steps,
        [`stepsLog.${today}`]: steps,
        lastUpdated: new Date().toISOString()
      };

      await updateDoc(doc(db, 'users', user.uid), updateData);
      
      // Update leaderboards
      await updateLeaderboards();
      
      // Refresh user profile
      await fetchUserProfile(user.uid);
    } catch (error) {
      console.error('Error saving steps to Firestore:', error);
    }
  };

  const updateLeaderboards = async () => {
    try {
      // This would typically be done server-side, but for demo we'll do it client-side
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = [];
      
      usersSnapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() });
      });

      // Individual leaderboard
      const individualLeaderboard = users
        .sort((a, b) => (b.totalSteps || 0) - (a.totalSteps || 0))
        .slice(0, 50)
        .map((user, index) => ({
          ...user,
          rank: index + 1
        }));

      // Class leaderboard
      const classGroups = {};
      users.forEach(user => {
        if (user.class) {
          if (!classGroups[user.class]) {
            classGroups[user.class] = [];
          }
          classGroups[user.class].push(user);
        }
      });

      const classLeaderboard = Object.entries(classGroups)
        .map(([className, classUsers]) => {
          const avgSteps = classUsers.reduce((sum, user) => sum + (user.totalSteps || 0), 0) / classUsers.length;
          return {
            className,
            avgSteps: Math.round(avgSteps),
            studentCount: classUsers.length,
            totalSteps: classUsers.reduce((sum, user) => sum + (user.totalSteps || 0), 0)
          };
        })
        .sort((a, b) => b.avgSteps - a.avgSteps)
        .slice(0, 20)
        .map((classData, index) => ({
          ...classData,
          rank: index + 1
        }));

      // Grade leaderboard
      const gradeGroups = {};
      users.forEach(user => {
        if (user.grade) {
          if (!gradeGroups[user.grade]) {
            gradeGroups[user.grade] = [];
          }
          gradeGroups[user.grade].push(user);
        }
      });

      const gradeLeaderboard = Object.entries(gradeGroups)
        .map(([grade, gradeUsers]) => {
          const avgSteps = gradeUsers.reduce((sum, user) => sum + (user.totalSteps || 0), 0) / gradeUsers.length;
          return {
            grade,
            avgSteps: Math.round(avgSteps),
            studentCount: gradeUsers.length,
            totalSteps: gradeUsers.reduce((sum, user) => sum + (user.totalSteps || 0), 0)
          };
        })
        .sort((a, b) => b.avgSteps - a.avgSteps)
        .slice(0, 10)
        .map((gradeData, index) => ({
          ...gradeData,
          rank: index + 1
        }));

      setLeaderboards({
        individual: individualLeaderboard,
        class: classLeaderboard,
        grade: gradeLeaderboard
      });
    } catch (error) {
      console.error('Error updating leaderboards:', error);
    }
  };

  const loadLeaderboards = async () => {
    try {
      await updateLeaderboards();
    } catch (error) {
      console.error('Error loading leaderboards:', error);
    }
  };

  const loadEvents = () => {
    try {
      const eventsQuery = query(
        collection(db, 'events'),
        orderBy('startDate', 'desc')
      );

      const unsubscribe = onSnapshot(eventsQuery, (snapshot) => {
        const eventsData = [];
        snapshot.forEach(doc => {
          eventsData.push({ id: doc.id, ...doc.data() });
        });
        setEvents(eventsData);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const createEvent = async (eventData) => {
    try {
      await addDoc(collection(db, 'events'), {
        ...eventData,
        createdAt: new Date().toISOString(),
        isActive: true
      });
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      await deleteDoc(doc(db, 'events', eventId));
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  };

  const getTotalSteps = () => {
    return userProfile?.totalSteps || 0;
  };

  const getBadgeProgress = (badgeId) => {
    const badge = badgeDefinitions.find(b => b.id === badgeId);
    if (!badge) return 0;
    
    const totalSteps = getTotalSteps();
    return Math.min((totalSteps / badge.steps) * 100, 100);
  };

  const getNextBadge = () => {
    const totalSteps = getTotalSteps();
    const earnedBadges = userProfile?.earnedBadges || [];
    
    return badgeDefinitions.find(badge => 
      totalSteps < badge.steps && !earnedBadges.includes(badge.id)
    );
  };

  const getDailyProgress = () => {
    return Math.min((todaySteps / stepGoal) * 100, 100);
  };

  const getWeeklyAverage = () => {
    if (weeklySteps.length === 0) return 0;
    const total = weeklySteps.reduce((sum, day) => sum + day.steps, 0);
    return Math.round(total / weeklySteps.length);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('tr-TR').format(num);
  };

  const value = {
    // Step tracking
    dailySteps,
    todaySteps,
    isTracking,
    stepGoal,
    weeklySteps,
    
    // Badges
    badges,
    badgeDefinitions,
    
    // Leaderboards
    leaderboards,
    
    // Events
    events,
    
    // Methods
    startStepTracking,
    stopStepTracking,
    saveStepsToFirestore,
    getTotalSteps,
    getBadgeProgress,
    getNextBadge,
    getDailyProgress,
    getWeeklyAverage,
    formatNumber,
    checkForNewBadges,
    loadLeaderboards,
    createEvent,
    deleteEvent,
    setStepGoal
  };

  return (
    <StepContext.Provider value={value}>
      {children}
    </StepContext.Provider>
  );
};