'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { 
  LogOut, 
  Trash2
} from 'lucide-react'
import { getMobileNavigationItems } from '@/config/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface MobileNavigationSheetProps {
  children: React.ReactNode
}

const MobileNavigationSheet: React.FC<MobileNavigationSheetProps> = ({ 
  children
}) => {
  const { userData, logout } = useAuth()
  const router = useRouter()
  const [open, setOpen] = React.useState(false)
  const navigationItems = getMobileNavigationItems()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
      setOpen(false)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleNavigation = (href: string) => {
    router.push(href)
    setOpen(false)
  }

  const handleDeleteAccount = () => {
    setOpen(false)
  }

  const getInitials = () => {
    if (userData?.name) {
      const names = userData.name.split(' ')
      return names.length > 1 
        ? `${names[0][0]}${names[names.length - 1][0]}` 
        : names[0][0]
    }
    return 'U'
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent side="left" className="w-80 p-0 bg-white">
        
        <SheetHeader className="sr-only">
          <SheetTitle>Navigation Menu</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full">
          
          <div className="bg-dark p-6 text-white">
            <div className="flex items-center space-x-3">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-white/20 text-white text-lg font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">
                  {userData?.name || 'John Doe'}
                </h3>
                <p className="text-white/80 text-sm">
                  {userData?.email || 'johndoe123@gmail.com'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-gray-50">
            <div className="py-2">
              {navigationItems.map((item) => (
                <button
                  key={item.title}
                  onClick={() => handleNavigation(item.href)}
                  className="w-full flex items-center space-x-4 px-6 py-3 text-left hover:bg-gray-100 transition-colors"
                >
                  <item.icon className="w-5 h-5 text-gray-600" />
                  <span className="text-gray-700 font-medium">{item.title}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gray-50 border-t border-gray-200">
            <button
              onClick={handleDeleteAccount}
              className="w-full flex items-center space-x-3 px-6 py-4 text-left hover:bg-gray-100 transition-colors"
            >
              <Trash2 className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">Delete Account</span>
            </button>
            
            <div className="bg-cyan-500">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-6 py-4 text-left text-white hover:bg-cyan-600 transition-colors"
              >
                <LogOut className="w-5 h-5 text-white" />
                <span className="font-medium">Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default MobileNavigationSheet
