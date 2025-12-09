import { useState, useEffect } from 'react';
import { ref, onValue, off, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { 
  SubscriptionPlan, 
  EnhancedSubscriptionInfo, 
  SubscriptionUsage, 
  SubscriptionLimits,
  SUBSCRIPTION_PLANS 
} from '@/types/subscription.type';

export const useEnhancedSubscription = () => {
  const [subscriptionInfo, setSubscriptionInfo] = useState<EnhancedSubscriptionInfo | null>(null);
  const [subscriptionLimits, setSubscriptionLimits] = useState<SubscriptionLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userData } = useAuth();

  // Get subscription plan by ID
  const getPlanById = (planId: string): SubscriptionPlan | undefined => {
    return SUBSCRIPTION_PLANS.find(plan => plan.id === planId);
  };

  // Calculate daily usage reset time (midnight)
  const getDailyResetTime = (): number => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime();
  };

  // Check if usage should be reset
  const shouldResetDailyUsage = (resetDate: number): boolean => {
    const now = new Date();
    const resetTime = new Date(resetDate);
    return now >= resetTime;
  };

  // Reset daily usage counters
  const resetDailyUsage = async (userId: string): Promise<SubscriptionUsage> => {
    const newUsage: SubscriptionUsage = {
      ridesUsedToday: 0,
      totalRidesThisMonth: subscriptionInfo?.usage.totalRidesThisMonth || 0,
      totalRideTimeToday: 0,
      totalRideTimeThisMonth: subscriptionInfo?.usage.totalRideTimeThisMonth || 0,
      resetDate: getDailyResetTime()
    };

    try {
      await update(ref(database, `users/${userId}/subscription/usage`), newUsage);
      return newUsage;
    } catch (err) {
      console.error('Failed to reset daily usage:', err);
      return newUsage;
    }
  };

  // Calculate subscription limits based on plan and current usage
  const calculateLimits = (plan: SubscriptionPlan, usage: SubscriptionUsage): SubscriptionLimits => {
    const dailyRideLimit = plan.features.dailyRideLimit;
    const maxRideTimeMinutes = plan.features.maxRideTimeMinutes;
    
    const ridesRemaining = dailyRideLimit === -1 ? -1 : Math.max(0, dailyRideLimit - usage.ridesUsedToday);
    const rideTimeRemaining = maxRideTimeMinutes === -1 ? -1 : Math.max(0, maxRideTimeMinutes - usage.totalRideTimeToday);
    
    return {
      dailyRideLimit,
      maxRideTimeMinutes,
      ridesRemaining,
      rideTimeRemaining,
      isAtDailyLimit: dailyRideLimit !== -1 && usage.ridesUsedToday >= dailyRideLimit,
      isAtTimeLimit: maxRideTimeMinutes !== -1 && usage.totalRideTimeToday >= maxRideTimeMinutes
    };
  };

  // Check if user can start a new ride
  const canStartNewRide = (limits: SubscriptionLimits): boolean => {
    return !limits.isAtDailyLimit && !limits.isAtTimeLimit;
  };

  // Update ride usage after completing a ride
  const updateRideUsage = async (rideTimeMinutes: number): Promise<boolean> => {
    if (!userData?.uid || !subscriptionInfo) return false;

    try {
      const currentUsage = subscriptionInfo.usage;
      
      // Check if daily usage should be reset
      if (shouldResetDailyUsage(currentUsage.resetDate)) {
        await resetDailyUsage(userData.uid);
      }

      const updatedUsage: SubscriptionUsage = {
        ...currentUsage,
        ridesUsedToday: currentUsage.ridesUsedToday + 1,
        totalRidesThisMonth: currentUsage.totalRidesThisMonth + 1,
        totalRideTimeToday: currentUsage.totalRideTimeToday + rideTimeMinutes,
        totalRideTimeThisMonth: currentUsage.totalRideTimeThisMonth + rideTimeMinutes,
        lastRideDate: Date.now()
      };

      await update(ref(database, `users/${userData.uid}/subscription/usage`), updatedUsage);
      return true;
    } catch (err) {
      console.error('Failed to update ride usage:', err);
      return false;
    }
  };

  // Subscribe to a new plan
  const subscribeToPlan = async (planId: string): Promise<boolean> => {
    if (!userData?.uid) return false;

    const plan = getPlanById(planId);
    if (!plan) return false;

    try {
      const startDate = Date.now();
      const expiryDate = new Date(startDate + (plan.duration * 24 * 60 * 60 * 1000));
      
      const subscriptionData = {
        planId: plan.id,
        planName: plan.name,
        startDate: startDate,
        expiryDate: expiryDate.getTime(),
        autoRenew: true,
        isActive: true,
        usage: {
          ridesUsedToday: 0,
          totalRidesThisMonth: 0,
          totalRideTimeToday: 0,
          totalRideTimeThisMonth: 0,
          resetDate: getDailyResetTime()
        }
      };

      await update(ref(database, `users/${userData.uid}/subscription`), subscriptionData);
      return true;
    } catch (err) {
      console.error('Failed to subscribe to plan:', err);
      return false;
    }
  };

  // Cancel subscription
  const cancelSubscription = async (): Promise<boolean> => {
    if (!userData?.uid) return false;

    try {
      await update(ref(database, `users/${userData.uid}/subscription`), {
        autoRenew: false,
        isActive: false
      });
      return true;
    } catch (err) {
      console.error('Failed to cancel subscription:', err);
      return false;
    }
  };

  // Load subscription data
  useEffect(() => {
    if (!userData?.uid) {
      setLoading(false);
      return;
    }

    const subscriptionRef = ref(database, `users/${userData.uid}/subscription`);
    
    const unsubscribe = onValue(subscriptionRef, async (snapshot) => {
      try {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const plan = getPlanById(data.planId);
          
          if (!plan) {
            setError('Invalid subscription plan');
            setLoading(false);
            return;
          }

          // Check if subscription is expired
          const isExpired = data.expiryDate && Date.now() > data.expiryDate;
          const remainingDays = data.expiryDate ? Math.max(0, Math.ceil((data.expiryDate - Date.now()) / (1000 * 60 * 60 * 24))) : 0;

          let usage = data.usage || {
            ridesUsedToday: 0,
            totalRidesThisMonth: 0,
            totalRideTimeToday: 0,
            totalRideTimeThisMonth: 0,
            resetDate: getDailyResetTime()
          };

          // Reset daily usage if needed
          if (shouldResetDailyUsage(usage.resetDate)) {
            usage = await resetDailyUsage(userData.uid);
          }

          const limits = calculateLimits(plan, usage);

          const enhancedInfo: EnhancedSubscriptionInfo = {
            isActive: !isExpired && data.isActive,
            currentPlan: plan,
            expiryDate: data.expiryDate ? new Date(data.expiryDate).toISOString() : undefined,
            startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
            autoRenew: data.autoRenew || false,
            usage,
            remainingDays,
            canRideToday: !limits.isAtDailyLimit,
            canRideNow: canStartNewRide(limits),
            nextResetTime: usage.resetDate
          };

          setSubscriptionInfo(enhancedInfo);
          setSubscriptionLimits(limits);
        } else {
          // No subscription data
          setSubscriptionInfo({
            isActive: false,
            autoRenew: false,
            usage: {
              ridesUsedToday: 0,
              totalRidesThisMonth: 0,
              totalRideTimeToday: 0,
              totalRideTimeThisMonth: 0,
              resetDate: getDailyResetTime()
            },
            remainingDays: 0,
            canRideToday: false,
            canRideNow: false,
            nextResetTime: getDailyResetTime()
          });
          setSubscriptionLimits(null);
        }
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load subscription');
        setLoading(false);
      }
    });

    return () => off(subscriptionRef, 'value', unsubscribe);
  }, [userData?.uid]);

  return {
    subscriptionInfo,
    subscriptionLimits,
    loading,
    error,
    availablePlans: SUBSCRIPTION_PLANS,
    subscribeToPlan,
    cancelSubscription,
    updateRideUsage,
    canStartNewRide: subscriptionLimits ? canStartNewRide(subscriptionLimits) : false,
    getPlanById
  };
};