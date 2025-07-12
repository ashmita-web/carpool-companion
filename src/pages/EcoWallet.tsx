import { useState, useEffect } from 'react'
import { Coins, Leaf, Calculator, TrendingUp, Users, Award, Car } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Button from '../components/UI/Button'
import Input from '../components/UI/Input'

interface UserProfile {
  id: string;
  full_name: string;
  eco_coins: number;
  total_rides: number;
  co2_saved: number;
  rides_to_next_coin?: number;
  shared_completed_rides?: number;
}

interface LeaderboardUser {
  full_name: string
  eco_coins: number
  weekly_rides: number
}

export default function EcoWallet() {
  const { user } = useAuth()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([])
  const [totalCO2Saved, setTotalCO2Saved] = useState(0)
  const [loading, setLoading] = useState(true)

  const [costForm, setCostForm] = useState({
    distance: '',
    daysPerWeek: '5',
    fuelType: 'petrol'
  })
  const [costComparison, setCostComparison] = useState<any>(null)

  useEffect(() => {
    fetchUserData()
    fetchLeaderboard()
    fetchTotalCO2Saved()
  }, [user])
  
  const fetchUserData = async () => {
    if (!user) return;
  
    try {
      // 1. Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
  
      if (profileError) throw profileError;
  
      // 2. Fetch user's own completed rides
      const { data: rides, error: ridesError } = await supabase
        .from('rides')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'completed');
  
      if (ridesError) throw ridesError;
  
      const totalRides = rides?.length || 0;
  
      // 3. Fetch accepted matches where user is driver or rider
      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('ride_id, driver_id, rider_id')
        .or(`driver_id.eq.${user.id},rider_id.eq.${user.id}`)
        .eq('status', 'accepted');
  
      if (matchesError) throw matchesError;
  
      const rideIds = matches?.map((m: any) => m.ride_id) || [];
  
      // 4. Fetch statuses for those matched ride_ids
      const { data: rideDetails, error: rideError } = await supabase
        .from('rides')
        .select('id, status')
        .in('id', rideIds);
  
      if (rideError) throw rideError;
  
      // 5. Count completed shared rides (only if driver ≠ rider)
      const sharedCompletedRides =
        matches?.filter((m: any) => {
          const ride = rideDetails.find((r: any) => r.id === m.ride_id);
          return ride?.status === 'completed' && m.driver_id !== m.rider_id;
        }).length || 0;
  
      const ecoCoins = Math.floor(sharedCompletedRides / 5);
      const ridesToNextCoin = 5 - (sharedCompletedRides % 5);
      const co2Saved = totalRides * 20 * 0.12;
  
      // 6. Update eco_coins in profile
      await supabase
        .from('profiles')
        .update({ eco_coins: ecoCoins })
        .eq('id', user.id);
  
      // 7. Set all eco-related user stats
      setUserProfile({
        ...profile,
        eco_coins: ecoCoins,
        total_rides: totalRides,
        co2_saved: co2Saved,
        rides_to_next_coin: ridesToNextCoin,
        shared_completed_rides: sharedCompletedRides,
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
  

  const fetchLeaderboard = async () => {
    try {
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, eco_coins')
        .order('eco_coins', { ascending: false })
        .limit(10)

      if (error) throw error

      const leaderboardWithRides = data?.map((user) => ({
        ...user,
        weekly_rides: Math.max(1, Math.floor(user.eco_coins / 5))
      })) || []

      setLeaderboard(leaderboardWithRides)
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    }
  }

  const fetchTotalCO2Saved = async () => {
    try {
      const { data, error } = await supabase
        .from('rides')
        .select('id')
        .eq('status', 'completed')

      if (error) throw error

      const totalRides = data?.length || 0
      const totalCO2 = totalRides * 20 * 0.12

      setTotalCO2Saved(totalCO2)
    } catch (error) {
      console.error('Error fetching total CO2 data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateCostComparison = () => {
    const distance = parseFloat(costForm.distance)
    const days = parseInt(costForm.daysPerWeek)
    if (!distance || !days) return

    const fuelCosts = { petrol: 100, diesel: 90, cng: 60 }
    const fuelEfficiency = { petrol: 15, diesel: 20, cng: 18 }

    const fuelCost = fuelCosts[costForm.fuelType as keyof typeof fuelCosts]
    const efficiency = fuelEfficiency[costForm.fuelType as keyof typeof fuelEfficiency]

    const monthlyDistance = distance * days * 4.33
    const monthlyFuelCost = (monthlyDistance / efficiency) * fuelCost
    const monthlyToll = distance > 20 ? 800 : 400
    const monthlyParking = days * 4.33 * 50
    const monthlyMaintenance = 2000

    const totalPersonalCost = monthlyFuelCost + monthlyToll + monthlyParking + monthlyMaintenance
    const carpoolCost = (monthlyFuelCost + monthlyToll) / 2
    const savings = totalPersonalCost - carpoolCost

    setCostComparison({
      personalCost: totalPersonalCost,
      carpoolCost,
      savings,
      fuelCost: monthlyFuelCost,
      toll: monthlyToll,
      parking: monthlyParking,
      maintenance: monthlyMaintenance
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading eco data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Eco & Wallet</h1>
          <p className="mt-2 text-gray-600">Track your environmental impact and savings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Eco Coins Section */}
<div className="lg:col-span-1">
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
    <div className="flex items-center mb-4">
      <div className="bg-yellow-100 p-3 rounded-lg">
        <Coins className="w-6 h-6 text-yellow-600" />
      </div>
      <div className="ml-4">
        <h2 className="text-xl font-semibold text-gray-900">Eco Coins</h2>

        {/* Tooltip explanation */}
        <div className="text-sm text-gray-600 relative group flex items-center space-x-1">
          <span>1 coin per 5 shared rides</span>
          <svg
            className="w-4 h-4 text-gray-400 cursor-pointer"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M12 20h.01M12 4v.01"
            />
          </svg>

          <div className="absolute left-6 top-6 z-10 bg-white border border-gray-200 rounded-md shadow-md p-2 text-xs w-64 opacity-0 group-hover:opacity-100 group-hover:pointer-events-auto pointer-events-none transition-opacity duration-200">
            <strong>Shared rides</strong> = completed rides with both a driver and a different rider. Solo rides don't count toward eco coins.
          </div>
        </div>
      </div>
    </div>

    <div className="text-center py-6">
      <div className="text-4xl font-bold text-yellow-600 mb-2">
        {userProfile?.eco_coins || 0}
      </div>
      <p className="text-gray-600">Your Eco Coins</p>



  {/* Progress bar based on shared rides toward next coin */}
  <div className="mt-4 bg-gray-100 rounded-full h-2">
    <div
      className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
      style={{
        width: `${Math.min(((userProfile?.shared_completed_rides || 0) % 5) * 20, 100)}%`,
      }}
    ></div>
  </div>

  <p className="text-xs text-gray-500 mt-2">
    {userProfile?.rides_to_next_coin === 0
      ? '🎉 You just earned a new coin!'
      : `${userProfile?.rides_to_next_coin || 5} more shared rides to your next coin`}
  </p>
</div>


              <div className="border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Rides:</span>
                  <span className="font-medium">{userProfile?.total_rides || 0}</span>
                </div>
              </div>
            </div>

            {/* Leaderboard */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <Award className="w-5 h-5 text-orange-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Weekly Leaderboard</h3>
              </div>
              
              <div className="space-y-3">
                {leaderboard.slice(0, 5).map((user, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        
                        {index + 1}
                      </div>
                      <span className="ml-3 text-sm font-medium text-gray-900">
                        {user.full_name}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Coins className="w-4 h-4 text-yellow-500 mr-1" />
                      {user.eco_coins}
                    </div>
                  </div>
                  
                ))
                }
              </div>
            </div>
          </div>

          {/* CO2 Savings Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <Leaf className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-900">CO₂ Savings</h2>
                  <p className="text-sm text-gray-600">Environmental impact</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {(userProfile?.co2_saved || 0).toFixed(1)} kg
                  </div>
                  <p className="text-gray-600">CO₂ saved by you</p>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {totalCO2Saved.toFixed(1)} kg
                  </div>
                  <p className="text-gray-600">Total saved by all users</p>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <TrendingUp className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">Impact Equivalent</span>
                  </div>
                  <p className="text-xs text-green-700 mb-2">
  Your savings = {(userProfile?.co2_saved || 0) / 21 < 1
    ? `${((userProfile?.co2_saved || 0) / 21 * 100).toFixed(0)}% of your first tree planted 🎋`
    : `${Math.floor((userProfile?.co2_saved || 0) / 21)} trees planted 🎋`}
</p>

<div className="bg-green-100 rounded-full h-2">
  <div
    className="bg-green-500 h-2 rounded-full transition-all duration-300"
    style={{
      width: `${Math.min(((userProfile?.co2_saved || 0) / 21) * 100, 100)}%`,
    }}
  ></div>
</div>

                  <p className="text-xs text-green-700">
                    Community savings = {Math.floor(totalCO2Saved / 21)} trees planted
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Rides Completed</span>
                    <span>{userProfile?.total_rides || 0}/20</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${Math.min(((userProfile?.total_rides || 0) / 20) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>CO₂ Saved</span>
                    <span>{(userProfile?.co2_saved || 0).toFixed(1)}/50 kg</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${Math.min(((userProfile?.co2_saved || 0) / 50) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Cost Comparison Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Calculator className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h2 className="text-xl font-semibold text-gray-900">Cost Comparison</h2>
                  <p className="text-sm text-gray-600">Personal vs Carpool</p>
                </div>
              </div>

              <form className="space-y-4 mb-6">
                <Input
                  label="Daily Distance (km)"
                  type="number"
                  value={costForm.distance}
                  onChange={(e) => setCostForm({ ...costForm, distance: e.target.value })}
                  placeholder="e.g., 25"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Days per Week
                  </label>
                  <select
                    value={costForm.daysPerWeek}
                    onChange={(e) => setCostForm({ ...costForm, daysPerWeek: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="5">5 days</option>
                    <option value="6">6 days</option>
                    <option value="7">7 days</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuel Type
                  </label>
                  <select
                    value={costForm.fuelType}
                    onChange={(e) => setCostForm({ ...costForm, fuelType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="petrol">Petrol</option>
                    <option value="diesel">Diesel</option>
                    <option value="cng">CNG</option>
                  </select>
                </div>

                <Button
                  type="button"
                  onClick={calculateCostComparison}
                  className="w-full"
                >
                  Calculate Savings
                </Button>
              </form>

              {costComparison && (
                <div className="space-y-4">
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Car className="w-4 h-4 text-red-600 mr-2" />
                      <span className="text-sm font-medium text-red-800">Personal Vehicle</span>
                    </div>
                    <div className="text-2xl font-bold text-red-600">
                      ₹{costComparison.personalCost.toFixed(0)}/month
                    </div>
                    <div className="text-xs text-red-700 mt-2 space-y-1">
                      <div>Fuel: ₹{costComparison.fuelCost.toFixed(0)}</div>
                      <div>Toll: ₹{costComparison.toll}</div>
                      <div>Parking: ₹{costComparison.parking.toFixed(0)}</div>
                      <div>Maintenance: ₹{costComparison.maintenance}</div>
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Users className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-800">Carpooling</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      ₹{costComparison.carpoolCost.toFixed(0)}/month
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <TrendingUp className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-800">Monthly Savings</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      ₹{costComparison.savings.toFixed(0)}
                    </div>
                    <p className="text-xs text-blue-700 mt-1">
                      Annual savings: ₹{(costComparison.savings * 12).toFixed(0)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}