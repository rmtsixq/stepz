import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { useAuth } from './AuthContext';
import * as Notifications from 'expo-notifications';

const StepContext = createContext();

export const useSteps = () => {
  const context = useContext(StepContext);
  if (!context) {
    throw new Error('useSteps must be used within a StepProvider');
  }
  return context;
};

export const StepProvider = ({ children }) => {
  const { user, userProfile } = useAuth();
  const [dailySteps, setDailySteps] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [todaySteps, setTodaySteps] = useState(0);
  const [weeklySteps, setWeeklySteps] = useState([]);
  const [badges, setBadges] = useState([]);

  // Badge definitions
  const badgeDefinitions = [
    { id: 'bronze', name: 'Bronz Yürüyüşçü', emoji: '🥉', steps: 1000, color: '#CD7F32' },
    { id: 'silver', name: 'Gümüş Koşucu', emoji: '🥈', steps: 5000, color: '#C0C0C0' },
    { id: 'gold', name: 'Altın Atlet', emoji: '🥇', steps: 10000, color: '#FFD700' },
    { id: 'diamond', name: 'Elmas Şampiyon', emoji: '🏅', steps: 20000, color: '#B9F2FF' },
    { id: 'legend', name: 'Efsane Yürüyüşçü', emoji: '👑', steps: 50000, color: '#9B59B6' },
  ];

  const startStepTracking = async () => {
    try {
      setIsTracking(true);
      
      // Simulated step tracking - In real app, integrate with Google Fit API
      const interval = setInterval(() => {
        setDailySteps(prev => {
          const newSteps = prev + Math.floor(Math.random() * 5) + 1;
          setTodaySteps(newSteps);
          checkForNewBadges(newSteps);
          return newSteps;
        });
      }, 2000);

      return interval;
    } catch (error) {
      console.error('Error starting step tracking:', error);
      setIsTracking(false);
    }
  };

  const stopStepTracking = () => {
    setIsTracking(false);
  };

  const checkForNewBadges = async (steps) => {
    if (!user || !userProfile) return;

    const earnedBadges = userProfile.earnedBadges || [];
    const newBadges = [];

    badgeDefinitions.forEach(badge => {
      if (steps >= badge.steps && !earnedBadges.includes(badge.id)) {
        newBadges.push(badge.id);
      }
    });

    if (newBadges.length > 0) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          earnedBadges: arrayUnion(...newBadges)
        });

        // Send notification for new badge
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

        setBadges(prev => [...prev, ...newBadges]);
      } catch (error) {
        console.error('Error updating badges:', error);
      }
    }
  };

  const saveStepsToFirestore = async (steps) => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const updateData = {
        totalSteps: (userProfile?.totalSteps || 0) + steps,
        [`stepsLog.${today}`]: steps,
        lastUpdated: new Date().toISOString()
      };

      await updateDoc(doc(db, 'users', user.uid), updateData);
    } catch (error) {
      console.error('Error saving steps:', error);
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

  const formatNumber = (num) => {
    return new Intl.NumberFormat('tr-TR').format(num);
  };

  useEffect(() => {
    if (userProfile) {
      setBadges(userProfile.earnedBadges || []);
      
      // Load today's steps
      const today = new Date().toISOString().split('T')[0];
      const todayStepsCount = userProfile.stepsLog?.[today] || 0;
      setTodaySteps(todayStepsCount);
    }
  }, [userProfile]);

  const value = {
    dailySteps,
    todaySteps,
    isTracking,
    weeklySteps,
    badges,
    badgeDefinitions,
    startStepTracking,
    stopStepTracking,
    saveStepsToFirestore,
    getTotalSteps,
    getBadgeProgress,
    getNextBadge,
    formatNumber,
    checkForNewBadges
  };

  return (
    <StepContext.Provider value={value}>
      {children}
    </StepContext.Provider>
  );
};