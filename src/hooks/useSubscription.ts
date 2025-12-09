'use client'

import { useState, useEffect, useCallback } from 'react'
import { database } from '@/lib/firebase'
import { ref, get } from 'firebase/database'
import { useAuth } from '@/contexts/AuthContext'

interface SubscriptionItem {
  expiryDate?: string;
  endDate?: string;
  planType?: string;
  type?: string;
  planName?: string;
  name?: string;
  [key: string]: unknown;
}

interface SubscriptionData {
  [key: string]: SubscriptionItem;
}

interface SubscriptionInfo {
  isActive: boolean
  expiryDate?: string
  planType?: string
  planName?: string
}

interface UseSubscriptionReturn {
  hasActiveSubscription: boolean
  subscriptionData: SubscriptionData | null
  subscriptionInfo: SubscriptionInfo | null
  loading: boolean
  error: string | null
  checkSubscription: () => Promise<void>
  refreshSubscription: () => Promise<void>
  isSubscriptionExpired: (subscriptionId: string) => boolean
  getActiveSubscriptions: () => SubscriptionItem[]
}


export const useSubscription = (): UseSubscriptionReturn => {
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false)
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null)
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { userData, loading: authLoading } = useAuth()

  // Utility function to check if a subscription is expired
  const isSubscriptionExpired = useCallback((subscriptionId: string): boolean => {
    if (!subscriptionData || !subscriptionData[subscriptionId]) {
      return true
    }
    
    const subscription = subscriptionData[subscriptionId]
    const expiryDate = subscription.expiryDate || subscription.endDate
    
    if (!expiryDate) {
      return false // No expiry date means active
    }
    
    return new Date(expiryDate) < new Date()
  }, [subscriptionData])

  // Get all active (non-expired) subscriptions
  const getActiveSubscriptions = useCallback((): SubscriptionItem[] => {
    if (!subscriptionData) {
      return []
    }
    
    return Object.entries(subscriptionData)
      .filter(([subscriptionId]) => !isSubscriptionExpired(subscriptionId))
      .map(([, subscription]) => subscription)
  }, [subscriptionData, isSubscriptionExpired])

  // Function to check user subscription
  const checkUserSubscription = useCallback(async (phoneNumber: string) => {
    try {
      setLoading(true)
      setError(null)
      
      const userRef = ref(database, `Users/${phoneNumber}`)
      const snapshot = await get(userRef)
      
      if (snapshot.exists()) {
        const userData = snapshot.val()
        
        // Check if MySubscriptions field exists and has active subscription
        const subscriptions = userData.MySubscriptions
        
        setSubscriptionData(subscriptions || null)
        
        // Parse subscription info
        if (subscriptions) {
          // Calculate active status inline instead of using parseSubscriptionInfo
          const activeSubscriptions = Object.entries(subscriptions)
            .filter(([, subscription]) => {
              const sub = subscription as SubscriptionItem
              const expiryDate = sub.expiryDate || sub.endDate
              if (!expiryDate) return true
              return new Date(expiryDate) >= new Date()
            })
          
          const isActive = activeSubscriptions.length > 0
          
          if (isActive) {
            const latestSubscription = activeSubscriptions[0][1] as SubscriptionItem
            const info: SubscriptionInfo = {
              isActive: true,
              expiryDate: (latestSubscription.expiryDate || latestSubscription.endDate) as string,
              planType: (latestSubscription.planType || latestSubscription.type) as string,
              planName: (latestSubscription.planName || latestSubscription.name) as string
            }
            setSubscriptionInfo(info)
            setHasActiveSubscription(true)
          } else {
            setSubscriptionInfo({ isActive: false })
            setHasActiveSubscription(false)
          }
        } else {
          setSubscriptionInfo({ isActive: false })
          setHasActiveSubscription(false)
        }
        
        return { success: true, data: userData }
      } else {
        setHasActiveSubscription(false)
        setSubscriptionData(null)
        setSubscriptionInfo({ isActive: false })
        return { success: false, error: 'User not found' }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to check subscription'
      setError(errorMessage)
      setHasActiveSubscription(false)
      setSubscriptionData(null)
      setSubscriptionInfo({ isActive: false })
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, []) // Remove parseSubscriptionInfo dependency

  // Function to manually trigger subscription check
  const checkSubscription = useCallback(async () => {
    if (!userData?.phoneNumber) {
      setError('No phone number available')
      return
    }
    
    await checkUserSubscription(userData.phoneNumber)
  }, [userData?.phoneNumber, checkUserSubscription])

  // Function to refresh subscription data
  const refreshSubscription = useCallback(async () => {
    await checkSubscription()
  }, [checkSubscription])

  // Auto-check subscription when user data is available
  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!userData) {
      setHasActiveSubscription(false)
      setSubscriptionData(null)
      setSubscriptionInfo({ isActive: false })
      setError('No user data available')
      return
    }

    const phoneNumber = userData.phoneNumber
    
    if (!phoneNumber) {
      setError('No phone number found in user data')
      setHasActiveSubscription(false)
      setSubscriptionData(null)
      setSubscriptionInfo({ isActive: false })
      return
    }

    checkUserSubscription(phoneNumber)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, userData?.phoneNumber, checkUserSubscription]) // Only phoneNumber needed, full userData would cause unnecessary re-runs

  return {
    hasActiveSubscription,
    subscriptionData,
    subscriptionInfo,
    loading,
    error,
    checkSubscription,
    refreshSubscription,
    isSubscriptionExpired,
    getActiveSubscriptions
  }
}
