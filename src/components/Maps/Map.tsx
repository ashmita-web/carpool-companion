import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L, { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete (Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom icons for different marker types
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  })
}

const pickupIcon = createCustomIcon('#10B981') // Green
const dropoffIcon = createCustomIcon('#EF4444') // Red
const offerIcon = createCustomIcon('#3B82F6') // Blue

interface MapProps {
  center: { lat: number; lng: number }
  zoom?: number
  markers?: Array<{
    position: { lat: number; lng: number }
    title: string
    type: 'pickup' | 'dropoff' | 'offer'
  }>
  className?: string
  onLocationSelect?: (lat: number, lng: number) => void
}

export default function Map({ 
  center, 
  zoom = 13, 
  markers = [], 
  className = '',
  onLocationSelect 
}: MapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([center.lat, center.lng])

  useEffect(() => {
    setMapCenter([center.lat, center.lng])
  }, [center])

  const getMarkerIcon = (type: 'pickup' | 'dropoff' | 'offer') => {
    switch (type) {
      case 'pickup':
        return pickupIcon
      case 'dropoff':
        return dropoffIcon
      case 'offer':
        return offerIcon
      default:
        return undefined
    }
  }

  const MapEvents = () => {
    const map = useMap()
    
    useEffect(() => {
      if (onLocationSelect) {
        const handleClick = (e: L.LeafletMouseEvent) => {
          onLocationSelect(e.latlng.lat, e.latlng.lng)
        }
        
        map.on('click', handleClick)
        
        return () => {
          map.off('click', handleClick)
        }
      }
    }, [map])
    
    return null
  }

  return (
    <div className={`${className} rounded-lg overflow-hidden border border-gray-200`}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%', minHeight: '300px' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {onLocationSelect && <MapEvents />}
        
        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={[marker.position.lat, marker.position.lng]}
            icon={getMarkerIcon(marker.type)}
          >
            <Popup>
              <div className="text-sm">
                <strong>{marker.title}</strong>
                <br />
                <span className="text-gray-600">
                  {marker.type === 'pickup' ? 'Pickup Location' : 
                   marker.type === 'dropoff' ? 'Drop-off Location' : 'Ride Offer'}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}