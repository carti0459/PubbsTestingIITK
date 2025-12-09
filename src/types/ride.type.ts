export interface Location {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface RideRoute {
  startLocation: Location;
  endLocation?: Location;
  waypoints: Location[];
  totalDistance: number; // in meters
}

export interface RideFare {
  baseFare: number;
  timeCharge: number; // per minute
  distanceCharge: number; // per km
  totalFare: number;
  currency: string;
}

export interface Ride {
  id: string;
  bikeId: string;
  userId: string;
  status: 'active' | 'completed' | 'cancelled' | 'paused';
  startTime: number;
  endTime?: number;
  duration?: number; // in minutes
  route: RideRoute;
  fare: RideFare;
  paymentStatus: 'pending' | 'paid' | 'failed';
  unlockCode?: string;
  createdAt: number;
  updatedAt: number;
}

export interface RideStats {
  totalRides: number;
  totalDistance: number; // in km
  totalDuration: number; // in minutes
  totalFare: number;
  averageRideTime: number; // in minutes
  averageDistance: number; // in km
  favoriteRoute?: {
    startArea: string;
    endArea: string;
    count: number;
  };
}

export interface ActiveRideSession {
  rideId: string;
  startTime: number;
  currentLocation: Location;
  distanceTraveled: number;
  currentFare: number;
  estimatedEndFare: number;
}