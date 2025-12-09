export interface SubscriptionPlan {
  id: string;
  subscriptionId: string;
  planName: string;
  price: number;
  description: string;
  validityTime: number;
  maxFreeRide: number;
  carryForward: number;
  areaId: string;
  areaName: string;
  status: string | boolean;
  createdBy?: string;
  createdDate?: string;
}

export interface CreateSubscriptionRequest {
  operator: string;
  subscription: {
    subscriptionId?: string;
    subscriptionPlanName: string;
    subscriptionPlanPrice: string | number;
    subscriptionDescription?: string;
    subscriptionValidityTime?: string | number;
    subscriptionMaxFreeRide?: string | number;
    subscriptionCarryForward?: string | number;
    areaId: string;
    areaName: string;
    createdBy?: string;
  };
}

export interface SubscriptionResponse {
  success: boolean;
  operator: string;
  totalSubscriptions: number;
  subscriptions: SubscriptionPlan[];
}

export interface CreateSubscriptionResponse {
  success: boolean;
  message: string;
  subscriptionKey: string;
  subscription: any;
}