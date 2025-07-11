import React, { useState, useEffect } from 'react'
import { Search, MapPin, Calendar, Users, DollarSign, Clock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { matchRides } from '../lib/groq'
import Button from '../components/UI/Button'
import LocationInput from '../components/Maps/LocationInput'
import Map from '../components/Maps/Map'
import { format } from 'date-fns'
import 'leaflet/dist/leaflet.css';


interface RideOffer {
  id: string
  user_id: string
  pickup_location: string
  pickup_lat: number
  pickup_lng: number
  dropoff_location: string
  dropoff_lat: number
  dropoff_lng: number
  departure_time: string
  available_seats: number
  price: number | null
  preferences: string | null
  profiles: {
    full_name: string
    email: string
  }
}

export default function FindRides() {
  const { user } = useAuth()
  const [searchForm, setSearchForm] = useState({
    pickupLocation: '',
    pickupLat: 0,
    pickupLng: 0,
    dropoffLocation: '',
    dropoffLat: 0,
    dropoffLng: 0,
    departureTime: '',
    preferences: ''
  })
  const [rideOffers, setRideOffers] = useState<RideOffer[]>([])
  const [matchedRides, setMatchedRides] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchAvailableRides()
  }, [])

  const fetchAvailableRides = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('rides')
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
        .eq('type', 'offer')
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) throw error

      setRideOffers(data || [])
    } catch (error) {
      console.error('Error fetching rides:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!searchForm.pickupLocation || !searchForm.dropoffLocation) {
      setErrors({
        pickup: !searchForm.pickupLocation ? 'Pickup location is required' : '',
        dropoff: !searchForm.dropoffLocation ? 'Drop-off location is required' : ''
      })
      return
    }

    setSearching(true)
    setErrors({})

    try {
      // Use AI to match rides
      const matches = await matchRides(searchForm, rideOffers)
      setMatchedRides(matches)
    } catch (error) {
      console.error('Error matching rides:', error)
      setErrors({ search: 'Failed to find matching rides' })
    } finally {
      setSearching(false)
    }
  }

  const handleLocationChange = (field: string, location: string, lat: number, lng: number) => {
    setSearchForm({
      ...searchForm,
      [`${field}Location`]: location,
      [`${field}Lat`]: lat,
      [`${field}Lng`]: lng
    })
  }

  const requestRide = async (rideId: string) => {
    try {
      const { error } = await supabase
        .from('matches')
        .insert([
          {
            rider_id: user?.id,
            driver_id: rideOffers.find(r => r.id === rideId)?.user_id,
            ride_id: rideId,
            match_score: 85,
            status: 'pending'
          }
        ])

      if (error) throw error

      alert('Ride request sent successfully!')
    } catch (error) {
      console.error('Error requesting ride:', error)
      alert('Failed to send ride request')
    }
  }

  const displayRides = matchedRides.length > 0 ? matchedRides : rideOffers

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find Rides</h1>
          <p className="mt-2 text-gray-600">Search for available rides or browse all offers</p>
        </div>

        Search Form
        <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <LocationInput
              label="From"
              value={searchForm.pickupLocation}
              onChange={(location, lat, lng) => handleLocationChange('pickup', location, lat, lng)}
              placeholder="Pickup location"
              error={errors.pickup}
            />

            <LocationInput
              label="To"
              value={searchForm.dropoffLocation}
              onChange={(location, lat, lng) => handleLocationChange('dropoff', location, lat, lng)}
              placeholder="Drop-off location"
              error={errors.dropoff}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Departure Time (Optional)
              </label>
              <input
                type="datetime-local"
                value={searchForm.departureTime}
                onChange={(e) => setSearchForm({ ...searchForm, departureTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mt-4">
            <Button
              type="submit"
              loading={searching}
              icon={Search}
              className="w-full md:w-auto"
            >
              Search Rides
            </Button>
          </div>

          {errors.search && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{errors.search}</p>
            </div>
          )}
        </form>

        Results
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ride List */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {matchedRides.length > 0 ? 'Matched Rides' : 'Available Rides'}
            </h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Loading rides...</p>
              </div>
            ) : displayRides.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No rides found</p>
                <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
              </div>
            ) : (
              <div className="space-y-4">
                {displayRides.map((ride) => (
                  <div
                    key={ride.id}
                    className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">{ride.profiles?.full_name || 'Driver'}</h3>
                        {matchedRides.length > 0 && (
                          <span className="text-sm text-green-600 font-medium">
                            {ride.match_score}% match
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-1" />
                          {format(new Date(ride.departure_time), 'MMM d, HH:mm')}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Users className="w-4 h-4 mr-1" />
                          {ride.available_seats} seats available
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-green-600" />
                        <span>{ride.pickup_location}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-red-600" />
                        <span>{ride.dropoff_location}</span>
                      </div>
                    </div>

                    {ride.price && (
                      <div className="flex items-center text-sm text-gray-600 mb-4">
                        <DollarSign className="w-4 h-4 mr-1" />
                        <span>${ride.price} per person</span>
                      </div>
                    )}

                    {ride.preferences && (
                      <div className="text-sm text-gray-600 mb-4">
                        <p className="font-medium">Preferences:</p>
                        <p>{ride.preferences}</p>
                      </div>
                    )}

                    <Button
                      onClick={() => requestRide(ride.id)}
                      size="sm"
                      className="w-full"
                    >
                      Request Ride
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Map */}
<div style={{ background: 'yellow', padding: '8px' }}>
  <h2 className="text-xl font-semibold text-gray-900 mb-4">Map View</h2>
  <Map
    center={{ lat: 37.7749, lng: -122.4194 }}
    markers={displayRides.map(ride => ({
      position: { lat: ride.pickup_lat, lng: ride.pickup_lng },
      title: `${ride.pickup_location} → ${ride.dropoff_location}`,
      type: 'offer' as const
    }))}
    className="h-96"
  />
</div>

        </div>
      </div>
    </div>
  )
}

