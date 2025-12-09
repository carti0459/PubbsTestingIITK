export interface SystemMetrics {
  totalBikes: number;
  activeBikes: number;
  availableBikes: number;
  maintenanceBikes: number;
  totalUsers: number;
  activeUsers: number;
  totalRides: number;
  activeRides: number;
  completedRidesToday: number;
  totalRevenue: number;
  revenueToday: number;
  averageRideDuration: number;
  systemUptime: number;
  lastUpdated: number;
}

export interface BikeMaintenanceRecord {
  id: string;
  bikeId: string;
  type: 'scheduled' | 'repair' | 'inspection' | 'cleaning';
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  scheduledDate: number;
  completedDate?: number;
  estimatedDuration: number; // in hours
  cost?: number;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface UserManagement {
  id: string;
  phoneNumber: string;
  email?: string;
  name?: string;
  status: 'active' | 'suspended' | 'banned';
  subscriptionStatus: 'none' | 'active' | 'expired';
  totalRides: number;
  totalSpent: number;
  lastRideDate?: number;
  registrationDate: number;
  violations: number;
  riskScore: number; // 0-100, higher is riskier
}

export interface SystemAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: 'bike' | 'user' | 'system' | 'revenue' | 'security';
  title: string;
  message: string;
  bikeId?: string;
  userId?: string;
  acknowledged: boolean;
  createdAt: number;
  acknowledgedAt?: number;
  acknowledgedBy?: string;
}

export interface AnalyticsData {
  rideTrends: {
    date: string;
    rides: number;
    revenue: number;
    duration: number;
  }[];
  popularRoutes: {
    startArea: string;
    endArea: string;
    count: number;
    averageDistance: number;
  }[];
  bikeUtilization: {
    bikeId: string;
    utilization: number; // percentage
    totalRides: number;
    revenue: number;
  }[];
  userSegments: {
    segment: string;
    count: number;
    revenue: number;
    averageRides: number;
  }[];
  peakHours: {
    hour: number;
    rides: number;
    utilization: number;
  }[];
}

export interface MaintenanceSchedule {
  id: string;
  bikeId: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  taskName: string;
  description: string;
  estimatedDuration: number;
  priority: 'low' | 'medium' | 'high';
  nextDue: number;
  lastCompleted?: number;
  isOverdue: boolean;
}