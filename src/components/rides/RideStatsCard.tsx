import React from 'react';
import { RideStats } from '@/types/ride.type';

interface RideStatsCardProps {
  stats: RideStats;
  loading?: boolean;
}

export const RideStatsCard: React.FC<RideStatsCardProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header with brand gradient */}
      <div className="bg-gradient-to-r from-[#0E171E] to-[#18B8DB] px-6 py-4">
        <h3 className="text-xl font-bold text-white">Ride Statistics</h3>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-gradient-to-br from-[#18B8DB]/10 to-[#18B8DB]/20 rounded-xl border border-[#18B8DB]/30 hover:scale-105 transition-transform duration-200">
          <div className="text-2xl font-bold text-[#18B8DB]">{stats.totalRides}</div>
          <div className="text-sm text-[#BEBEBE] font-medium">Total Rides</div>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-br from-[#0E171E]/10 to-[#0E171E]/20 rounded-xl border border-[#0E171E]/30 hover:scale-105 transition-transform duration-200">
          <div className="text-2xl font-bold text-[#0E171E]">{stats.totalDistance.toFixed(1)}km</div>
          <div className="text-sm text-[#BEBEBE] font-medium">Total Distance</div>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-br from-[#18B8DB]/10 to-[#0E171E]/10 rounded-xl border border-[#D9D9D9] hover:scale-105 transition-transform duration-200">
          <div className="text-2xl font-bold text-[#0E171E]">{formatDuration(stats.totalDuration)}</div>
          <div className="text-sm text-[#BEBEBE] font-medium">Total Time</div>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-green-600/20 rounded-xl border border-green-300/50 hover:scale-105 transition-transform duration-200">
          <div className="text-2xl font-bold text-green-600">₹{stats.totalFare.toFixed(2)}</div>
          <div className="text-sm text-[#BEBEBE] font-medium">Total Spent</div>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-br from-[#18B8DB]/10 to-[#18B8DB]/20 rounded-xl border border-[#18B8DB]/30 hover:scale-105 transition-transform duration-200">
          <div className="text-2xl font-bold text-[#18B8DB]">{stats.averageRideTime}m</div>
          <div className="text-sm text-[#BEBEBE] font-medium">Avg Duration</div>
        </div>
        
        <div className="text-center p-4 bg-gradient-to-br from-[#0E171E]/10 to-[#0E171E]/20 rounded-xl border border-[#0E171E]/30 hover:scale-105 transition-transform duration-200">
          <div className="text-2xl font-bold text-[#0E171E]">{stats.averageDistance.toFixed(1)}km</div>
          <div className="text-sm text-[#BEBEBE] font-medium">Avg Distance</div>
        </div>
        </div>
      </div>

      {stats.favoriteRoute && (
        <div className="mt-6 bg-gradient-to-r from-[#D9D9D9]/20 to-[#18B8DB]/20 rounded-xl p-4 border border-[#D9D9D9]/50 mx-6 mb-6">
          <h4 className="font-semibold text-[#0E171E] mb-2">Favorite Route</h4>
          <p className="text-sm text-[#0E171E] font-medium">
            {stats.favoriteRoute.startArea} → {stats.favoriteRoute.endArea}
          </p>
          <p className="text-xs text-[#BEBEBE] font-medium">{stats.favoriteRoute.count} rides completed</p>
        </div>
      )}
    </div>
  );
};