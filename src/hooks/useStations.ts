'use client'

import { useState, useEffect, useCallback } from 'react'

export interface MarkerItem {
  id?: string;
  latitude?: number;
  longitude?: number;
  [key: string]: unknown;
}

export interface Station {
  id: string
  name: string
  latitude: number
  longitude: number
  areaId: string
  areaName: string
  radius: number
  status: boolean
  type: string
  markerList: MarkerItem[]
  coordinates: {
    lat: number
    lng: number
  }
}

interface UseStationsReturn {
  stations: Station[]
  loading: boolean
  error: string | null
  fetchStations: (area: string) => Promise<void>
  refreshStations: () => Promise<void>
}

export const useStations = (initialArea: string = 'PubbsTesting'): UseStationsReturn => {
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentArea, setCurrentArea] = useState(initialArea)

  const fetchStations = useCallback(async (area: string) => {
    try {
      setLoading(true)
      setError(null)
      setCurrentArea(area)

      const response = await fetch(`/api/stations?area=${encodeURIComponent(area)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch stations')
      }

      setStations(result.data || [])
      
      return result.data

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch stations'
      console.error('❌ useStations: Error fetching stations:', errorMessage)
      setError(errorMessage)
      setStations([])
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshStations = useCallback(async () => {
    await fetchStations(currentArea)
  }, [fetchStations, currentArea])

  // Auto-fetch stations on mount
  useEffect(() => {
    fetchStations(initialArea)
  }, [fetchStations, initialArea])

  return {
    stations,
    loading,
    error,
    fetchStations,
    refreshStations
  }
}