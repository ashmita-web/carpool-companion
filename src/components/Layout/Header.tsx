import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Car, User, LogOut, Menu, X } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export default function Header() {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  const isActive = (path: string) => location.pathname === path

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-2 rounded-lg">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">CarpoolCompanion</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/dashboard"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/dashboard')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/rides"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/rides')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Find/Offer Rides
            </Link>
            <Link
              to="/eco"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/eco')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Eco & Wallet
            </Link>
            <Link
              to="/chat"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/chat')
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              AI Assistant
            </Link>
            <Link
    to="/upgrade"
    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive('/upgrade')
        ? 'bg-yellow-100 text-yellow-700'
        : 'text-gray-700 hover:text-yellow-600'
    }`}
  >
    Go Premium
  </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-600" />
                  <span className="text-sm text-gray-700">{user.email}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Sign Out</span>
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/dashboard')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/rides"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/rides')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Find/Offer Rides
              </Link>
              <Link
                to="/eco"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/eco')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Eco & Wallet
              </Link>

              <Link
  to="/matches"
  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
    isActive('/matches')
      ? 'bg-blue-100 text-blue-700'
      : 'text-gray-700 hover:text-blue-600'
  }`}
  onClick={() => setIsMenuOpen(false)}
>
  Match Requests
</Link>

              <Link
                to="/offer"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/offer')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Offer Ride
              </Link>
              <Link
                to="/upgrade"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/upgrade')
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'text-gray-700 hover:text-yellow-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Go Premium
              </Link>
              <Link
                to="/chat"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/chat')
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                AI Assistant
              </Link>

              
            </div>
          </div>
        )}
      </div>
    </header>
  )
}