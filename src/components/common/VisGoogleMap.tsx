'use client'

import React from 'react'
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  useMap
} from '@vis.gl/react-google-maps'

interface Location {
  key: string
  location: google.maps.LatLngLiteral
  title?: string
  description?: string
  radius?: number
  status?: boolean
  isPolygon?: boolean
  coordinates?: google.maps.LatLngLiteral[] // For polygon geofences
  color?: string // Custom color for geofence areas
  opacity?: number // Custom opacity for geofence areas
  stationData?: any // Station data for drawer display
}

interface VisGoogleMapProps {
  center?: google.maps.LatLngLiteral
  zoom?: number
  height?: string
  width?: string
  className?: string
  locations?: Location[]
  mapId?: string
  onMarkerClick?: (stationData: any) => void // Callback for marker clicks
}

// Separate component to handle circles and polygons
const MapWithCircles: React.FC<{ 
  locations: Location[]
  onMarkerClick?: (stationData: any) => void 
}> = ({ locations, onMarkerClick }) => {
  const map = useMap()
  const [circles, setCircles] = React.useState<google.maps.Circle[]>([])
  const [polygons, setPolygons] = React.useState<google.maps.Polygon[]>([])

  React.useEffect(() => {
    if (!map) return

    // Clear existing shapes
    circles.forEach(circle => circle.setMap(null))
    polygons.forEach(polygon => polygon.setMap(null))

    const newCircles: google.maps.Circle[] = []
    const newPolygons: google.maps.Polygon[] = []

    locations.forEach(location => {
      if (location.isPolygon && location.coordinates) {
        // Create polygon for geofence boundaries
        const polygon = new google.maps.Polygon({
          paths: location.coordinates,
          strokeColor: location.color || '#10B981', // Default green for allowed areas
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: location.color || '#10B981',
          fillOpacity: location.opacity || 0.2,
          map: map,
        })
        newPolygons.push(polygon)
      } else {
        // Create circle for station areas or point-based geofences
        const circle = new google.maps.Circle({
          strokeColor: location.color || (location.status ? '#10b981' : '#ef4444'),
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: location.color || (location.status ? '#10b981' : '#ef4444'),
          fillOpacity: location.opacity || 0.15,
          map: map,
          center: location.location,
          radius: location.radius || 30, // Default 30m radius
        })
        newCircles.push(circle)
      }
    })
    
    setCircles(newCircles)
    setPolygons(newPolygons)

    return () => {
      newCircles.forEach(circle => circle.setMap(null))
      newPolygons.forEach(polygon => polygon.setMap(null))
    }
  }, [map, locations])

  return (
    <>
      {locations.map((location) => (
        !location.isPolygon && (
          <AdvancedMarker
            key={location.key}
            position={location.location}
            onClick={() => {
              if (onMarkerClick && location.stationData) {
                onMarkerClick(location.stationData)
              }
            }}
          >
            <Pin 
              background={location.status ? '#22d3ee' : '#ef4444'} // Cyan for active, red for inactive
              glyphColor={'#000'} 
              borderColor={location.status ? '#0891b2' : '#dc2626'} 
            />
          </AdvancedMarker>
        )
      ))}
    </>
  )
}

const VisGoogleMap: React.FC<VisGoogleMapProps> = ({
  center = { lat: 28.6139, lng: 77.2090 }, // Default to Delhi
  zoom = 12,
  height = '500px',
  width = '100%',
  className = '',
  locations = [],
  mapId = 'DEMO_MAP_ID',
  onMarkerClick
}) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    return (
      <div 
        className={`flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg ${className}`}
        style={{ height, width }}
      >
        <div className="text-center p-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">Map Loading</h3>
          <p className="text-sm text-gray-500 mb-4">Google Maps will appear here</p>
          <div className="text-xs text-gray-400">
            Center: {center?.lat?.toFixed(4)}, {center?.lng?.toFixed(4)}
            <br />
            Zoom: {zoom}
            <br />
            Locations: {locations?.length || 0}
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className={className} style={{ height, width }}>
      <APIProvider 
        apiKey={apiKey} 
      >
        <Map
          defaultZoom={zoom}
          defaultCenter={center}
          mapId={mapId}
          style={{ width: '100%', height: '100%' }}
          disableDefaultUI={false}
          mapTypeControl={false}
          fullscreenControl={false}
          streetViewControl={false}
          zoomControl={true}
          gestureHandling={'greedy'}
        >
          <MapWithCircles locations={locations} onMarkerClick={onMarkerClick} />
        </Map>
      </APIProvider>
    </div>
  )
}

export default VisGoogleMap