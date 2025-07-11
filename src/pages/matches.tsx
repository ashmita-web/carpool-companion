import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import Button from '../components/UI/Button'

interface Match {
  id: string
  rider_id: string
  ride_id: string
  match_score: number
  status: string
  created_at: string
  rides: {
    pickup_location: string
    dropoff_location: string
    departure_time: string
  }
  profiles: {
    full_name: string
    email: string
  }
}

export default function MatchesPage() {
  const { user } = useAuth()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [showOnlyPending, setShowOnlyPending] = useState(true)

  useEffect(() => {
    if (user) fetchMatchRequests()
  }, [user])

  const fetchMatchRequests = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        rides (
          pickup_location,
          dropoff_location,
          departure_time
        ),
        profiles:profiles!matches_rider_id_fkey (
          full_name,
          email
        )
      `)
      .eq('driver_id', user?.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching matches:', error)
    } else {
      setMatches(data)
    }

    setLoading(false)
  }

  const updateMatchStatus = async (id: string, status: 'accepted' | 'declined') => {
    const { error } = await supabase
      .from('matches')
      .update({ status })
      .eq('id', id)

    if (error) {
      console.error('Error updating match:', error)
      return
    }

    fetchMatchRequests()
  }

  const filteredMatches = showOnlyPending
    ? matches.filter((match) => match.status === 'pending')
    : matches

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Ride Match Requests</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Pending Only</label>
          <input
            type="checkbox"
            checked={showOnlyPending}
            onChange={() => setShowOnlyPending(!showOnlyPending)}
            className="form-checkbox h-4 w-4 text-blue-600"
          />
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filteredMatches.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No match requests found.</p>
          {showOnlyPending && (
            <p className="text-sm text-gray-400">
              Try switching off "Pending Only" to view all matches.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMatches.map((match) => (
            <div
              key={match.id}
              className="bg-white border p-4 rounded-lg shadow-sm flex justify-between items-center"
            >
              <div>
              {match.profiles ? (
  <>
    <p className="font-semibold">{match.profiles.full_name}</p>
    <p className="text-sm text-gray-600">{match.profiles.email}</p>
  </>
) : (
  <p className="text-sm text-gray-500 italic">User info not available</p>
)}

                <p className="text-sm mt-1">
                  {match.rides.pickup_location} → {match.rides.dropoff_location}
                </p>
                <p className="text-sm text-gray-500">
                  {format(new Date(match.rides.departure_time), 'MMM d, HH:mm')}
                </p>
                <span
                  className={`inline-block mt-2 px-2 py-1 text-xs rounded-full font-medium ${
                    match.status === 'accepted'
                      ? 'bg-green-100 text-green-700'
                      : match.status === 'declined'
                      ? 'bg-red-100 text-red-700'
                      : match.status === 'completed'
                      ? 'bg-gray-100 text-gray-600'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {match.status}
                </span>
              </div>

              {match.status === 'pending' && (
                <div className="space-x-2">
                  <Button
                    onClick={() => updateMatchStatus(match.id, 'accepted')}
                    size="sm"
                  >
                    Accept
                  </Button>
                  <Button
                    onClick={() => updateMatchStatus(match.id, 'declined')}
                    size="sm"
                    variant="outline"
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
