'use client'

import React from 'react'
import Link from 'next/link'
import { MapPin, User, CreditCard, LogOut, ChevronDown } from 'lucide-react'
import { getDesktopNavigationItems } from '@/config/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  ClientOnlyDropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/client-only-dropdown-menu"
import { Button } from "@/components/ui/button"
import { StationSelector } from './'
import Image from "next/image"
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

interface DashboardSidebarProps {
  stations: any[]
  selectedStation: string
  onStationSelect: (stationId: string) => void
  stationsLoading: boolean
  getBikesByStation: (stationId: string) => any[]
  hasActiveSubscription: boolean
  onBuyPlan: () => void
  showSubscriptionWarning: boolean
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  stations,
  selectedStation,
  onStationSelect,
  stationsLoading,
  getBikesByStation,
  hasActiveSubscription,
  onBuyPlan
}) => {
  const { open } = useSidebar()
  const { logout, userData } = useAuth();
  const router = useRouter();
  const navigationItems = getDesktopNavigationItems();

  const displayName =
    userData?.name?.trim() ||
    userData?.displayName?.trim() ||
    userData?.username?.trim() ||
    "Please enter name";

  const displayEmail = userData?.email || "Email not available";

  const handleLogout = async () => {
     await logout();
     router.push('/login');
  }

  return (
    <Sidebar collapsible="icon" variant="floating" className="border-r border-slate-200">
      <SidebarHeader>
        <div className="flex items-center">
          <Image
            src="/assets/logo.svg"
            alt="PUBBS Logo"
            width={40}
            height={40}
            className="mr-3 transition-all duration-200"
          />
          {open && (
            <div>
              <h1 className="text-xl font-bold text-slate-900 transition-all duration-300">
                PUBBS
              </h1>
              <p className="text-sm text-slate-500">Bike Sharing</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-600 px-2 py-1 text-xs font-medium flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            Station Selection
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-2">
              <StationSelector
                stations={stations}
                selectedStation={selectedStation}
                onStationSelect={onStationSelect}
                loading={stationsLoading}
                getBikesByStation={getBikesByStation}
                variant="sidebar"
              />
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-600 px-2 py-1 text-xs font-medium">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      href={item.href}
                      className="hover:bg-slate-100 transition-all duration-200 cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <item.icon className="w-5 h-5 text-slate-600" />
                        <span className="text-slate-700">{item.title}</span>
                      </div>
                      {item.badge && (
                        <span className="bg-cyan-600 text-white text-xs font-medium px-2 py-1 rounded-full min-w-[20px] text-center">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!hasActiveSubscription && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-slate-600 px-2 py-1 text-xs font-medium">
              Subscription
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-2">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <CreditCard className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-red-800">
                        No Active Plan
                      </h4>
                      <p className="text-xs text-red-600 mt-1">
                        Subscribe to unlock bikes
                      </p>
                      <Button
                        onClick={onBuyPlan}
                        size="sm"
                        className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white text-xs"
                      >
                        Buy Plan
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        {hasActiveSubscription && (
          <div className="px-2 mb-2">
            <div className="bg-green-50 border border-green-200 rounded-lg p-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs font-medium text-green-800">
                  Subscription Active
                </span>
              </div>
            </div>
          </div>
        )}
        
        <ClientOnlyDropdownMenu
          triggerChildren={
            <Button
              variant="ghost"
              className="w-full justify-start h-auto p-2 hover:bg-slate-100"
            >
              <div className="flex items-center space-x-3 w-full">
                <div className="w-8 h-8 bg-cyan-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                {open && (
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-slate-900">
                      {displayName}
                    </p>
                    <p className="text-xs text-slate-500">{displayEmail}</p>
                  </div>
                )}
                {open && <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </Button>
          }
          contentProps={{
            align: "end",
            className: "w-56"
          }}
        >
          <DropdownMenuItem>
            <User className="w-4 h-4 mr-2" />
            View Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </DropdownMenuItem>
        </ClientOnlyDropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export default DashboardSidebar