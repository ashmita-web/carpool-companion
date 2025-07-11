import React, { useState, useEffect } from 'react'
import { Car, Users, Clock, TrendingUp, MapPin, Calendar } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'

interface DashboardStats {
  totalRides: number
  activeRides: number
  completedRides: number
  totalMatches: number
}

interface RecentRide {
  id: string
  type: 'offer' | 'request'
  pickup_location: string
  dropoff_location: string
  departure_time: string
  status: string
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalRides: 0,
    activeRides: 0,
    completedRides: 0,
    totalMatches: 0
  })
  const [recentRides, setRecentRides] = useState<RecentRide[]>([])
  const [loading, setLoading] = useState(true)
  const [hasPendingMatches, setHasPendingMatches] = useState(false)
  const [matchMap, setMatchMap] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    if (!user) return

    try {
      const { data: rides, error: ridesError } = await supabase
        .from('rides')
        .select('*')
        .or(`user_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (ridesError) throw ridesError

      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .or(`rider_id.eq.${user.id},driver_id.eq.${user.id}`)

      if (matchesError) throw matchesError

      const pendingDriverMatches = matches?.filter(
        match => match.driver_id === user.id && match.status === 'pending'
      )
      setHasPendingMatches(pendingDriverMatches?.length > 0)

      const totalRides = rides?.length || 0
      const activeRides = rides?.filter(ride => ride.status === 'active').length || 0
      const completedRides = rides?.filter(ride => ride.status === 'completed').length || 0
      const totalMatches = matches?.length || 0

      setStats({ totalRides, activeRides, completedRides, totalMatches })
      setRecentRides(rides?.slice(0, 5) || [])

      const matchStatusByRide: Record<string, string> = {}
      matches?.forEach(match => {
        if (match.rider_id === user.id) {
          matchStatusByRide[match.ride_id] = match.status
        }
      })
      setMatchMap(matchStatusByRide)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRideStatusUpdate = async (rideId: string, newStatus: string) => {
    const { error } = await supabase
      .from('rides')
      .update({ status: newStatus })
      .eq('id', rideId)

    if (error) {
      console.error('Error updating ride status:', error)
    } else {
      fetchDashboardData()
    }
  }

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-gray-900">{value}</h3>
          <p className="text-sm text-gray-600">{title}</p>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back! Here's your ride activity overview.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Rides" value={stats.totalRides} icon={Car} color="bg-blue-600" />
          <StatCard title="Active Rides" value={stats.activeRides} icon={Clock} color="bg-teal-600" />
          <StatCard title="Completed Rides" value={stats.completedRides} icon={TrendingUp} color="bg-green-600" />
          <StatCard title="Total Matches" value={stats.totalMatches} icon={Users} color="bg-orange-600" />
        </div>

        {hasPendingMatches && (
          <div className="mb-6">
            <Link to="/matches">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md shadow-sm transition-all">
                View Match Requests
              </button>
            </Link>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Rides</h2>

          {recentRides.length === 0 ? (
            <div className="text-center py-8">
              <Car className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No rides yet</p>
              <p className="text-sm text-gray-400">Start by offering or requesting a ride!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentRides.map((ride) => {
                const isDriver = ride.type === 'offer' && user?.id === user?.id
                const matchStatus = matchMap[ride.id] || null

                return (
                  <div
                    key={ride.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${ride.type === 'offer' ? 'bg-blue-100 text-blue-600' : 'bg-teal-100 text-teal-600'}`}>
                        {ride.type === 'offer' ? <Car className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{ride.type === 'offer' ? 'Ride Offer' : 'Ride Request'}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{ride.pickup_location} → {ride.dropoff_location}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(ride.departure_time), 'MMM d, HH:mm')}</span>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        ride.status === 'active' ? 'bg-green-100 text-green-800' :
                        ride.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                        ride.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {ride.status}
                      </span>

                      {/* Buttons for driver */}
                      {isDriver && ride.status === 'matched' && (
                        <button
                          onClick={() => handleRideStatusUpdate(ride.id, 'active')}
                          className="mt-1 text-xs px-3 py-1 bg-blue-600 text-white rounded-md"
                        >
                          Start Ride
                        </button>
                      )}
                      {isDriver && ride.status === 'active' && (
                        <button
                          onClick={() => handleRideStatusUpdate(ride.id, 'completed')}
                          className="mt-1 text-xs px-3 py-1 bg-green-600 text-white rounded-md"
                        >
                          Complete Ride
                        </button>
                      )}

                      {/* Buttons for matched rider */}
                      {!isDriver && matchStatus === 'accepted' && ride.status === 'active' && (
                        <button
                          onClick={() => handleRideStatusUpdate(ride.id, 'completed')}
                          className="mt-1 text-xs px-3 py-1 bg-gray-700 text-white rounded-md"
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
