"use client";

import React from "react";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";
import { DashboardSidebar, useDashboard } from "./_components";

interface MinDashboardLayoutProps {
  children: React.ReactNode;
}

const MinDashboardLayout: React.FC<MinDashboardLayoutProps> = ({ children }) => {
  const {
    // Station and subscription state
    selectedStation,
    showSubscriptionWarning,
    stations,
    stationsLoading,
    hasActiveSubscription,

    // Functions
    handleStationSelect,
    handleBuyPlan,
    getBikesByStation,
  } = useDashboard();

  return (
    <>
      <div className="hidden lg:flex h-screen w-full">
        <SidebarProvider>
          <DashboardSidebar
            stations={stations}
            selectedStation={selectedStation}
            onStationSelect={handleStationSelect}
            stationsLoading={stationsLoading}
            getBikesByStation={getBikesByStation}
            hasActiveSubscription={hasActiveSubscription}
            onBuyPlan={handleBuyPlan}
            showSubscriptionWarning={showSubscriptionWarning}
          />
          
          <SidebarInset className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto bg-gray-100">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>

      
      <div className="lg:hidden">
        <div className="min-h-screen bg-gray-100">
          {children}
        </div>
      </div>
    </>
  );
};

export default MinDashboardLayout;