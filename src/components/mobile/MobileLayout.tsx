import React from 'react';
import { MobileNavigation } from '@/components/mobile';
import { usePathname } from 'next/navigation';

interface MobileLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ 
  children, 
  showNavigation = true 
}) => {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 pb-safe">
      {/* Main Content */}
      <main className={`${showNavigation ? 'pb-20' : 'pb-0'}`}>
        {children}
      </main>

      {/* Mobile Navigation */}
      {showNavigation && (
        <MobileNavigation currentPath={pathname} />
      )}

      {/* Global styles for mobile */}
      <style jsx global>{`
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }
        
        /* Prevent iOS Safari bounce */
        body {
          position: fixed;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        
        #__next {
          height: 100%;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
        
        /* Hide scrollbars but keep functionality */
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        /* Touch optimization */
        .touch-optimized {
          touch-action: manipulation;
          -webkit-user-select: none;
          -webkit-touch-callout: none;
          -webkit-tap-highlight-color: transparent;
        }
        
        /* Mobile button styles */
        .mobile-btn {
          min-height: 44px;
          min-width: 44px;
          touch-action: manipulation;
        }
        
        /* Safe area handling */
        .safe-top {
          padding-top: env(safe-area-inset-top);
        }
        
        .safe-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
        
        .safe-left {
          padding-left: env(safe-area-inset-left);
        }
        
        .safe-right {
          padding-right: env(safe-area-inset-right);
        }
      `}</style>
    </div>
  );
};