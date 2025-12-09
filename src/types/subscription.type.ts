export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  duration: number;
  features: {
    dailyRideLimit: number;
    maxRideTimeMinutes: number;
    unlimitedUnlocks: boolean;
    premiumBikes: boolean;
    prioritySupport: boolean;
    discountRate: number;
  };
  description: string;
  isPopular?: boolean;
}

export interface SubscriptionUsage {
  ridesUsedToday: number;
  totalRidesThisMonth: number;
  totalRideTimeToday: number;
  totalRideTimeThisMonth: number;
  lastRideDate?: number;
  resetDate: number;
}

export interface EnhancedSubscriptionInfo {
  isActive: boolean;
  currentPlan?: SubscriptionPlan;
  expiryDate?: string;
  startDate?: string;
  autoRenew: boolean;
  usage: SubscriptionUsage;
  remainingDays: number;
  canRideToday: boolean;
  canRideNow: boolean;
  nextResetTime: number;
}

export interface SubscriptionLimits {
  dailyRideLimit: number;
  maxRideTimeMinutes: number;
  ridesRemaining: number;
  rideTimeRemaining: number;
  isAtDailyLimit: boolean;
  isAtTimeLimit: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 9.99,
    currency: "INR",
    duration: 30,
    features: {
      dailyRideLimit: 3,
      maxRideTimeMinutes: 60,
      unlimitedUnlocks: false,
      premiumBikes: false,
      prioritySupport: false,
      discountRate: 0,
    },
    description: "Perfect for occasional riders",
  },
  {
    id: "premium",
    name: "Premium",
    price: 19.99,
    currency: "INR",
    duration: 30,
    features: {
      dailyRideLimit: 8,
      maxRideTimeMinutes: 120,
      unlimitedUnlocks: true,
      premiumBikes: true,
      prioritySupport: true,
      discountRate: 10,
    },
    description: "Great for regular commuters",
    isPopular: true,
  },
  {
    id: "unlimited",
    name: "Unlimited",
    price: 39.99,
    currency: "INR",
    duration: 30,
    features: {
      dailyRideLimit: -1,
      maxRideTimeMinutes: -1,
      unlimitedUnlocks: true,
      premiumBikes: true,
      prioritySupport: true,
      discountRate: 20,
    },
    description: "Unlimited rides for power users",
  },
];
