import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/Layout/Header'
import ProtectedRoute from './components/Layout/ProtectedRoute'
import Home from './pages/Home'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import FindRides from './pages/FindRides'
import ChatAssistant from './pages/ChatAssistant'
import Rides from './pages/Rides'
import EcoWallet from './pages/EcoWallet'
import Upgrade from './pages/Upgrade'

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
            <Route path="/upgrade" element={<Upgrade />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
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