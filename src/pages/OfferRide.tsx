import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Car, Calendar, Users, DollarSign, MessageSquare } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Button from '../components/UI/Button'
import Input from '../components/UI/Input'
import LocationInput from '../components/Maps/LocationInput'

export default function OfferRide() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.pickupLocation) {
      newErrors.pickupLocation = 'Pickup location is required'
    }

    if (!formData.dropoffLocation) {
      newErrors.dropoffLocation = 'Drop-off location is required'
    }

    if (!formData.departureTime) {
      newErrors.departureTime = 'Departure time is required'
    }

    if (formData.availableSeats < 1 || formData.availableSeats > 8) {
      newErrors.availableSeats = 'Available seats must be between 1 and 8'
    }

    if (formData.price && (parseFloat(formData.price) < 0 || parseFloat(formData.price) > 1000)) {
      newErrors.price = 'Price must be between $0 and $1000'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setErrors({})

    try {
      const { error } = await supabase
        .from('rides')
        .insert([
          {
            user_id: user?.id,
            type: 'offer',
            pickup_location: formData.pickupLocation,
            pickup_lat: formData.pickupLat,
            pickup_lng: formData.pickupLng,
            dropoff_location: formData.dropoffLocation,
            dropoff_lat: formData.dropoffLat,
            dropoff_lng: formData.dropoffLng,
            departure_time: formData.departureTime,
            available_seats: formData.availableSeats,
            price: formData.price ? parseFloat(formData.price) : null,
            preferences: formData.preferences || null,
            status: 'active'
          }
        ])

      if (error) throw error

      navigate('/dashboard')
    } catch (error: any) {
      setErrors({ submit: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleLocationChange = (field: string, location: string, lat: number, lng: number) => {
    setFormData({
      ...formData,
      [`${field}Location`]: location,
      [`${field}Lat`]: lat,
      [`${field}Lng`]: lng
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Offer a Ride</h1>
          <p className="mt-2 text-gray-600">Share your journey and help others get around</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
          {/* Route Information */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Car className="w-5 h-5 mr-2" />
              Route Information
            </h2>
            
            <LocationInput
              label="Pickup Location"
              value={formData.pickupLocation}
              onChange={(location, lat, lng) => handleLocationChange('pickup', location, lat, lng)}
              placeholder="Where are you starting from?"
              error={errors.pickupLocation}
            />

            <LocationInput
              label="Drop-off Location"
              value={formData.dropoffLocation}
              onChange={(location, lat, lng) => handleLocationChange('dropoff', location, lat, lng)}
              placeholder="Where are you going?"
              error={errors.dropoffLocation}
            />
          </div>

          {/* Trip Details */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Trip Details
            </h2>

            <Input
              label="Departure Time"
              type="datetime-local"
              value={formData.departureTime}
              onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
              error={errors.departureTime}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Available Seats"
                type="number"
                min="1"
                max="8"
                value={formData.availableSeats}
                onChange={(e) => setFormData({ ...formData, availableSeats: parseInt(e.target.value) })}
                error={errors.availableSeats}
              />

              <Input
                label="Price per Person (Optional)"
                type="number"
                step="0.01"
                min="0"
                max="1000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                error={errors.price}
              />
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2" />
              Preferences (Optional)
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Information
              </label>
              <textarea
                value={formData.preferences}
                onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any preferences or additional details (e.g., music preferences, pet-friendly, etc.)"
              />
            </div>
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              icon={Car}
            >
              Offer Ride
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}