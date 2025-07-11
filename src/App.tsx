import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/Layout/Header'
import ProtectedRoute from './components/Layout/ProtectedRoute'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import FindRides from './pages/FindRides'
import OfferRide from './pages/OfferRide'
import ChatAssistant from './pages/ChatAssistant'
import Rides from './pages/Rides'
import EcoWallet from './pages/EcoWallet'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/find-rides" element={<FindRides />} />
            <Route path="/rides" element={<Rides />} />
            <Route path="/eco" element={<EcoWallet />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/offer"
              element={
                <ProtectedRoute>
                  <OfferRide />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatAssistant />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App