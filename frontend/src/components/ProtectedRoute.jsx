import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to user's permitted dashboard
    if (user.role === 'super_admin') return <Navigate to="/super-admin/dashboard" replace />
    if (user.role === 'city_admin') return <Navigate to="/city-admin/dashboard" replace />
    if (user.role === 'staff') return <Navigate to="/staff/dashboard" replace />
    return <Navigate to="/citizen/dashboard" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
