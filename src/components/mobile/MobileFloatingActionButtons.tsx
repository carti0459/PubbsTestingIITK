import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTouchGestures, vibrate } from '@/hooks/useTouchGestures';

interface MobileFloatingActionButtonsProps {
  className?: string;
}

export const MobileFloatingActionButtons: React.FC<MobileFloatingActionButtonsProps> = ({ 
  className = '' 
}) => {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);

  const mainButtonRef = useTouchGestures({
    onTap: () => {
      vibrate(50);
      setIsExpanded(!isExpanded);
    }
  });

  const navigateToPage = (path: string) => {
    vibrate(30);
    setIsExpanded(false);
    router.push(path);
  };

  const actionButtons = [
    {
      path: '/admin',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'bg-red-600 hover:bg-red-700',
      title: 'Admin'
    },
    {
      path: '/subscription',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'bg-yellow-600 hover:bg-yellow-700',
      title: 'Subscription'
    },
    {
      path: '/rides',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: 'bg-emerald-600 hover:bg-emerald-700',
      title: 'Rides'
    },
    {
      path: '/bikes',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      color: 'bg-blue-600 hover:bg-blue-700',
      title: 'Bikes'
    },
    {
      path: '/tracking',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'bg-purple-600 hover:bg-purple-700',
      title: 'Tracking'
    },
    {
      path: '/geofencing',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      color: 'bg-orange-600 hover:bg-orange-700',
      title: 'Geofencing'
    },
    {
      path: '/locks',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      color: 'bg-indigo-600 hover:bg-indigo-700',
      title: 'Locks'
    }
  ];

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`}>
      {/* Overlay to close FAB when expanded */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 -z-10"
          onClick={() => setIsExpanded(false)}
        />
      )}
      
      {/* Action Buttons */}
      <div className={`flex flex-col-reverse space-y-reverse space-y-3 mb-3 transition-all duration-300 ${
        isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        {actionButtons.map((button, index) => (
          <div
            key={button.path}
            className="flex items-center space-x-3"
            style={{
              transitionDelay: isExpanded ? `${index * 50}ms` : '0ms'
            }}
          >
            {/* Label */}
            <div className="bg-black bg-opacity-75 text-white px-3 py-1 rounded-lg text-sm whitespace-nowrap">
              {button.title}
            </div>
            
            {/* Button */}
            <button
              onClick={() => navigateToPage(button.path)}
              className={`w-12 h-12 ${button.color} text-white rounded-full shadow-lg transform transition-all duration-200 active:scale-95 hover:shadow-xl`}
              style={{
                minHeight: '48px',
                minWidth: '48px'
              }}
            >
              {button.icon}
            </button>
          </div>
        ))}
      </div>
      
      {/* Main FAB Button */}
      <button
        ref={mainButtonRef as React.RefObject<HTMLButtonElement>}
        className={`w-14 h-14 bg-cyan-500 hover:bg-cyan-600 text-white rounded-full shadow-lg transform transition-all duration-300 active:scale-95 hover:shadow-xl ${
          isExpanded ? 'rotate-45' : ''
        }`}
        style={{
          minHeight: '56px',
          minWidth: '56px'
        }}
        aria-label="Main menu"
      >
        <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    </div>
  );
};