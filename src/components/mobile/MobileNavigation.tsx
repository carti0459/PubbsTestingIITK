import React, { useState } from 'react';
import { useTouchGestures, vibrate } from '@/hooks/useTouchGestures';
import { useRouter } from 'next/navigation';

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface MobileNavigationProps {
  currentPath: string;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  currentPath
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(currentPath);
  const router = useRouter();
  
  // Touch gestures for swipe navigation
  const menuGestures = useTouchGestures({
    onSwipeRight: () => {
      if (!isMenuOpen) {
        setIsMenuOpen(true);
        vibrate(30);
      }
    },
    onSwipeLeft: () => {
      if (isMenuOpen) {
        setIsMenuOpen(false);
        vibrate(30);
      }
    },
    threshold: 50
  });

  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/minDashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z" />
        </svg>
      )
    },
    {
      id: 'rides',
      label: 'My Rides',
      href: '/rides',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      badge: 2
    },
    {
      id: 'bikes',
      label: 'Find Bikes',
      href: '/bikes',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    {
      id: 'subscription',
      label: 'Subscription',
      href: '/subscription',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      )
    },
    {
      id: 'profile',
      label: 'Profile',
      href: '/profile',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  const handleNavigation = (item: NavigationItem) => {
    setActiveTab(item.href);
    setIsMenuOpen(false);
    vibrate(50);
    router.push(item.href);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    vibrate(30);
  };

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-pb">
        <div className="flex items-center justify-around py-2">
          {navigationItems.slice(0, 4).map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavigation(item)}
              className={`flex flex-col items-center justify-center p-2 min-w-0 transition-colors ${
                activeTab === item.href
                  ? 'text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              style={{ minHeight: '60px', minWidth: '60px' }}
            >
              <div className="relative">
                {item.icon}
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1 truncate max-w-full">
                {item.label}
              </span>
            </button>
          ))}
          
          {/* Menu Button */}
          <button
            onClick={toggleMenu}
            className={`flex flex-col items-center justify-center p-2 min-w-0 transition-colors ${
              isMenuOpen ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
            style={{ minHeight: '60px', minWidth: '60px' }}
          >
            <svg 
              className={`w-6 h-6 transition-transform ${isMenuOpen ? 'rotate-90' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <span className="text-xs mt-1">Menu</span>
          </button>
        </div>
      </nav>

      {/* Slide-up Menu Overlay */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-45"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div 
            className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 transform transition-transform duration-300 safe-area-pb ${
              isMenuOpen ? 'translate-y-0' : 'translate-y-full'
            }`}
            {...menuGestures}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
            </div>

            {/* Menu Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Menu</h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  style={{ minHeight: '40px', minWidth: '40px' }}
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Menu Items */}
            <div className="px-6 py-4 max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item)}
                    className={`w-full flex items-center space-x-4 p-4 rounded-xl transition-colors ${
                      activeTab === item.href
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                    style={{ minHeight: '60px' }}
                  >
                    <div className="relative">
                      {item.icon}
                      {item.badge && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="flex-1 text-left font-medium">{item.label}</span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}

                {/* Additional Menu Items */}
                <div className="border-t border-gray-200 mt-4 pt-4">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                    More Options
                  </h3>
                  
                  <button className="w-full flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors"
                          style={{ minHeight: '60px' }}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="flex-1 text-left font-medium">Settings</span>
                  </button>

                  <button className="w-full flex items-center space-x-4 p-4 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors"
                          style={{ minHeight: '60px' }}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="flex-1 text-left font-medium">Help & Support</span>
                  </button>

                  <button className="w-full flex items-center space-x-4 p-4 rounded-xl hover:bg-red-50 text-red-600 transition-colors"
                          style={{ minHeight: '60px' }}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="flex-1 text-left font-medium">Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Safe area styles */}
      <style jsx>{`
        .safe-area-pb {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </>
  );
};