import React, { useState, useEffect } from 'react'
import { Search, Plus, MapPin, Calendar, Users, DollarSign, User, Shield, Music, Cigarette, Heart, UserCheck } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { usePremium, usePremiumGuard } from '../hooks/usePremium'
import { supabase } from '../lib/supabase'
import Button from '../components/UI/Button'
import Input from '../components/UI/Input'
import LocationInput from '../components/Maps/LocationInput'
import PremiumBadge from '../components/UI/PremiumBadge'
import PremiumTooltip from '../components/UI/PremiumTooltip'
import { format } from 'date-fns'

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
    eco_coins: number
    is_verified: boolean
    is_premium: boolean
  }
}

export default function Rides() {
  const { user } = useAuth()
  const { isPremium } = usePremium()
  const { requirePremium } = usePremiumGuard()
  const [activeTab, setActiveTab] = useState<'find' | 'offer'>('find')
  const [rideOffers, setRideOffers] = useState<RideOffer[]>([])
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [offerLoading, setOfferLoading] = useState(false)
  
  // Search form state
  const [searchForm, setSearchForm] = useState({
    origin: '',
    destination: '',
    date: '',
    // Premium filters
    smoking: '',
    music: '',
    pets: '',
    personality: ''
  })
  
  // Offer form state
  const [offerForm, setOfferForm] = useState({
    pickupLocation: '',
    pickupLat: 0,
    pickupLng: 0,
    dropoffLocation: '',
    dropoffLat: 0,
    dropoffLng: 0,
    departureTime: '',
    availableSeats: 1,
    price: '',
    preferences: ''
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchRideOffers()
  }, [])

  const fetchRideOffers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('rides')
        .select(`
          *,
          profiles (
            full_name,
            email,
            eco_coins,
            is_verified,
            is_premium
          )
        `)
        .eq('type', 'offer')
        .eq('status', 'active')
        .order('profiles.is_premium', { ascending: false })
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
    setSearchLoading(true)
    
    try {
      let query = supabase
        .from('rides')
        .select(`
          *,
          profiles (
            full_name,
            email,
            eco_coins,
            is_verified,
            is_premium
          )
        `)
        .eq('type', 'offer')
        .eq('status', 'active')

      if (searchForm.origin) {
        query = query.ilike('pickup_location', `%${searchForm.origin}%`)
      }
      
      if (searchForm.destination) {
        query = query.ilike('dropoff_location', `%${searchForm.destination}%`)
      }
      
      if (searchForm.date) {
        const startDate = new Date(searchForm.date)
        const endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + 1)
        
        query = query
          .gte('departure_time', startDate.toISOString())
          .lt('departure_time', endDate.toISOString())
      }

      const { data, error } = await query
        .order('profiles.is_premium', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      setRideOffers(data || [])
    } catch (error) {
      console.error('Error searching rides:', error)
      setErrors({ search: 'Failed to search rides' })
    } finally {
      setSearchLoading(false)
    }
  }

  const handleOfferRide = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!offerForm.pickupLocation || !offerForm.dropoffLocation || !offerForm.departureTime) {
      setErrors({
        pickup: !offerForm.pickupLocation ? 'Pickup location is required' : '',
        dropoff: !offerForm.dropoffLocation ? 'Drop-off location is required' : '',
        time: !offerForm.departureTime ? 'Departure time is required' : ''
      })
      return
    }

    setOfferLoading(true)
    setErrors({})

    try {
      // Calculate pricing cap based on route (example logic)
      let maxPrice = 100 // Default cap
      if (offerForm.pickupLocation.toLowerCase().includes('noida') && 
          offerForm.dropoffLocation.toLowerCase().includes('gurgaon')) {
        maxPrice = 100
      }

      const price = offerForm.price ? Math.min(parseFloat(offerForm.price), maxPrice) : null

      const { error } = await supabase
        .from('rides')
        .insert([
          {
            user_id: user?.id,
            type: 'offer',
            pickup_location: offerForm.pickupLocation,
            pickup_lat: offerForm.pickupLat,
            pickup_lng: offerForm.pickupLng,
            dropoff_location: offerForm.dropoffLocation,
            dropoff_lat: offerForm.dropoffLat,
            dropoff_lng: offerForm.dropoffLng,
            departure_time: offerForm.departureTime,
            available_seats: offerForm.availableSeats,
            price: price,
            preferences: offerForm.preferences || null,
            status: 'active'
          }
        ])

      if (error) throw error

      // Reset form
      setOfferForm({
        pickupLocation: '',
        pickupLat: 0,
        pickupLng: 0,
        dropoffLocation: '',
        dropoffLat: 0,
        dropoffLng: 0,
        departureTime: '',
        availableSeats: 1,
        price: '',
        preferences: ''
      })

      // Refresh rides list
      fetchRideOffers()
      
      // Switch to find tab to see the new ride
      setActiveTab('find')
    } catch (error: any) {
      setErrors({ submit: error.message })
    } finally {
      setOfferLoading(false)
    }
  }

  const handleLocationChange = (field: string, location: string, lat: number, lng: number) => {
    setOfferForm({
      ...offerForm,
      [`${field}Location`]: location,
      [`${field}Lat`]: lat,
      [`${field}Lng`]: lng
    })
  }

  const requestRide = async (rideId: string, driverId: string) => {
    try {
      const { error } = await supabase
        .from('matches')
        .insert([
          {
            rider_id: user?.id,
            driver_id: driverId,
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

  const handlePremiumFilterChange = (field: string, value: string) => {
    requirePremium(() => {
      setSearchForm({ ...searchForm, [field]: value })
    })
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find/Offer Rides</h1>
          <p className="mt-2 text-gray-600">Search for rides or offer your own journey</p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('find')}
              className={`flex-1 px-6 py-4 text-sm font-medium ${
                activeTab === 'find'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Search className="w-4 h-4 inline mr-2" />
              Find Rides
            </button>
            <button
              onClick={() => setActiveTab('offer')}
              className={`flex-1 px-6 py-4 text-sm font-medium ${
                activeTab === 'offer'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Offer Ride
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'find' ? (
              <div>
                {/* Search Form */}
                <form onSubmit={handleSearch} className="mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <Input
                      label="Origin"
                      value={searchForm.origin}
                      onChange={(e) => setSearchForm({ ...searchForm, origin: e.target.value })}
                      placeholder="From where?"
                    />
                    <Input
                      label="Destination"
                      value={searchForm.destination}
                      onChange={(e) => setSearchForm({ ...searchForm, destination: e.target.value })}
                      placeholder="To where?"
                    />
                    <Input
                      label="Date"
                      type="date"
                      value={searchForm.date}
                      onChange={(e) => setSearchForm({ ...searchForm, date: e.target.value })}
                    />
                  </div>
                  <Button type="submit" loading={searchLoading}>
                  {/* Premium Filters */}
                  <div className="border-t pt-4 mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      Advanced Filters
                      {!isPremium && <span className="ml-2 text-xs text-yellow-600">(Premium Only)</span>}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {isPremium ? (
                        <>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              <Cigarette className="w-3 h-3 inline mr-1" />
                              Smoking
                            </label>
                            <select
                              value={searchForm.smoking}
                              onChange={(e) => setSearchForm({ ...searchForm, smoking: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">Any</option>
                              <option value="no">Non-smoker</option>
                              <option value="yes">Smoker OK</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              <Music className="w-3 h-3 inline mr-1" />
                              Music
                            </label>
                            <select
                              value={searchForm.music}
                              onChange={(e) => setSearchForm({ ...searchForm, music: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">Any</option>
                              <option value="pop">Pop</option>
                              <option value="rock">Rock</option>
                              <option value="classical">Classical</option>
                              <option value="none">No music</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              <Heart className="w-3 h-3 inline mr-1" />
                              Pets
                            </label>
                            <select
                              value={searchForm.pets}
                              onChange={(e) => setSearchForm({ ...searchForm, pets: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">Any</option>
                              <option value="yes">Pet-friendly</option>
                              <option value="no">No pets</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              <UserCheck className="w-3 h-3 inline mr-1" />
                              Personality
                            </label>
                            <select
                              value={searchForm.personality}
                              onChange={(e) => setSearchForm({ ...searchForm, personality: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">Any</option>
                              <option value="introvert">Introvert</option>
                              <option value="extrovert">Extrovert</option>
                            </select>
                          </div>
                        </>
                      ) : (
                        <>
                          <PremiumTooltip>
                            <div>
                              <label className="block text-xs font-medium text-gray-400 mb-1">
                                <Cigarette className="w-3 h-3 inline mr-1" />
                                Smoking
                              </label>
                              <select disabled className="w-full px-2 py-1 text-sm border border-gray-200 rounded bg-gray-100 text-gray-400">
                                <option>Any</option>
                              </select>
                            </div>
                          </PremiumTooltip>
                          <PremiumTooltip>
                            <div>
                              <label className="block text-xs font-medium text-gray-400 mb-1">
                                <Music className="w-3 h-3 inline mr-1" />
                                Music
                              </label>
                              <select disabled className="w-full px-2 py-1 text-sm border border-gray-200 rounded bg-gray-100 text-gray-400">
                                <option>Any</option>
                              </select>
                            </div>
                          </PremiumTooltip>
                          <PremiumTooltip>
                            <div>
                              <label className="block text-xs font-medium text-gray-400 mb-1">
                                <Heart className="w-3 h-3 inline mr-1" />
                                Pets
                              </label>
                              <select disabled className="w-full px-2 py-1 text-sm border border-gray-200 rounded bg-gray-100 text-gray-400">
                                <option>Any</option>
                              </select>
                            </div>
                          </PremiumTooltip>
                          <PremiumTooltip>
                            <div>
                              <label className="block text-xs font-medium text-gray-400 mb-1">
                                <UserCheck className="w-3 h-3 inline mr-1" />
                                Personality
                              </label>
                              <select disabled className="w-full px-2 py-1 text-sm border border-gray-200 rounded bg-gray-100 text-gray-400">
                                <option>Any</option>
                              </select>
                            </div>
                          </PremiumTooltip>
                        </>
                      )}
                    </div>
                  </div>
                    Search Rides
                  </Button>
                </form>

                {/* Search Results */}
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Loading rides...</p>
                  </div>
                ) : rideOffers.length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No rides found</p>
                    <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {rideOffers.map((ride) => (
                      <div
                        key={ride.id}
                        className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <User className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 flex items-center">
                                {ride.profiles?.full_name || 'Driver'}
                                <PremiumBadge 
                                  isPremium={ride.profiles?.is_premium} 
                                  isVerified={ride.profiles?.is_verified}
                                />
                                {ride.profiles?.verified && (
                                  <Shield className="w-4 h-4 text-green-500 ml-1" />
                                )}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {ride.profiles?.eco_coins || 0} Eco Coins
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="w-4 h-4 mr-1" />
                              {format(new Date(ride.departure_time), 'MMM d, HH:mm')}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <Users className="w-4 h-4 mr-1" />
                              {ride.available_seats} seats
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
                            <span>₹{ride.price} per person</span>
                          </div>
                        )}

                        {ride.preferences && (
                          <div className="text-sm text-gray-600 mb-4">
                            <p className="font-medium">Preferences:</p>
                            <p className="text-xs">{ride.preferences}</p>
                          </div>
                        )}

                        <Button
                          onClick={() => requestRide(ride.id, ride.user_id)}
                          size="sm"
                          className="w-full"
                          disabled={ride.user_id === user?.id}
                        >
                          {ride.user_id === user?.id ? 'Your Ride' : 'Request Ride'}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Offer Ride Form */
              <form onSubmit={handleOfferRide} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LocationInput
                    label="Pickup Location"
                    value={offerForm.pickupLocation}
                    onChange={(location, lat, lng) => handleLocationChange('pickup', location, lat, lng)}
                    placeholder="Where are you starting from?"
                    error={errors.pickup}
                  />

                  <LocationInput
                    label="Drop-off Location"
                    value={offerForm.dropoffLocation}
                    onChange={(location, lat, lng) => handleLocationChange('dropoff', location, lat, lng)}
                    placeholder="Where are you going?"
                    error={errors.dropoff}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Departure Time"
                    type="datetime-local"
                    value={offerForm.departureTime}
                    onChange={(e) => setOfferForm({ ...offerForm, departureTime: e.target.value })}
                    error={errors.time}
                  />

                  <Input
                    label="Available Seats"
                    type="number"
                    min="1"
                    max="8"
                    value={offerForm.availableSeats}
                    onChange={(e) => setOfferForm({ ...offerForm, availableSeats: parseInt(e.target.value) })}
                  />

                  <Input
                    label="Price per Person (₹)"
                    type="number"
                    step="1"
                    min="0"
                    max="1000"
                    value={offerForm.price}
                    onChange={(e) => setOfferForm({ ...offerForm, price: e.target.value })}
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferences (Optional)
                  </label>
                  <textarea
                    value={offerForm.preferences}
                    onChange={(e) => setOfferForm({ ...offerForm, preferences: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any preferences or additional details..."
                  />
                </div>

                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-600">{errors.submit}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  loading={offerLoading}
                  className="w-full md:w-auto"
                >
                  Offer Ride
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}