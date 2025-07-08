import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { SocketProvider } from './context/SocketContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Stats from './pages/Stats'
import './App.css'

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <SocketProvider>
            <div className="min-h-screen dark:bg-gray-900">
              <Routes>
                <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/stats" element={<PrivateRoute><Stats /></PrivateRoute>} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </div>
          </SocketProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  )
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default App
