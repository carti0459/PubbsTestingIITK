'use client'

import React from 'react'
import MobileNavigationSheet from '@/components/mobile/MobileNavigationSheet'

interface MobileHeaderProps {
  children?: React.ReactNode
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ children }) => {
  return (
    <MobileNavigationSheet>
      {children}
    </MobileNavigationSheet>
  )
}

export default MobileHeader