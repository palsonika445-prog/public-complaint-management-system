import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

// Layouts
import PublicLayout from './layouts/PublicLayout'
import DashboardLayout from './layouts/DashboardLayout'
import ProtectedRoute from './components/ProtectedRoute'

// Public Pages
import LandingPage from './pages/public/LandingPage'
import AboutPage from './pages/public/AboutPage'
import PublicMapPage from './pages/public/PublicMapPage'
import PublicFeedPage from './pages/public/PublicFeedPage'
import PublicDetailPage from './pages/public/PublicDetailPage'
import LoginPage from './pages/public/LoginPage'
import RegisterPage from './pages/public/RegisterPage'
import AnonymousSubmitPage from './pages/public/AnonymousSubmitPage'
import AnonymousTrackPage from './pages/public/AnonymousTrackPage'

// Citizen Pages
import CitizenDashboard from './pages/citizen/CitizenDashboard'
import SubmitComplaintPage from './pages/citizen/SubmitComplaintPage'
import MyComplaintsPage from './pages/citizen/MyComplaintsPage'
import CitizenComplaintDetailPage from './pages/citizen/CitizenComplaintDetailPage'

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard'
import StaffComplaintsPage from './pages/staff/StaffComplaintsPage'
import StaffComplaintDetailPage from './pages/staff/StaffComplaintDetailPage'

// City Admin Pages
import CityDashboard from './pages/city_admin/CityDashboard'
import AssignComplaintsPage from './pages/city_admin/AssignComplaintsPage'
import DepartmentManagePage from './pages/city_admin/DepartmentManagePage'
import StaffManagePage from './pages/city_admin/StaffManagePage'
import SLAManagePage from './pages/city_admin/SLAManagePage'
import ReportsPage from './pages/city_admin/ReportsPage'

// Super Admin Pages
import SuperDashboard from './pages/super_admin/SuperDashboard'
import CityManagePage from './pages/super_admin/CityManagePage'
import CityAdminManagePage from './pages/super_admin/CityAdminManagePage'
import AuditLogsPage from './pages/super_admin/AuditLogsPage'

function App() {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/public-map" element={<PublicMapPage />} />
        <Route path="/public-feed" element={<PublicFeedPage />} />
        <Route path="/complaints/:id" element={<CitizenComplaintDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/anonymous/submit" element={<AnonymousSubmitPage />} />
        <Route path="/anonymous/track" element={<AnonymousTrackPage />} />
      </Route>

      {/* CITIZEN PROTECTED ROUTES */}
      <Route element={<ProtectedRoute allowedRoles={['citizen']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/citizen/dashboard" element={<CitizenDashboard />} />
          <Route path="/citizen/submit" element={<SubmitComplaintPage />} />
          <Route path="/citizen/complaints" element={<MyComplaintsPage />} />
        </Route>
      </Route>

      {/* STAFF PROTECTED ROUTES */}
      <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/staff/complaints" element={<StaffComplaintsPage />} />
          <Route path="/staff/complaints/:id" element={<StaffComplaintDetailPage />} />
        </Route>
      </Route>

      {/* CITY ADMIN PROTECTED ROUTES */}
      <Route element={<ProtectedRoute allowedRoles={['city_admin', 'super_admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/city-admin/dashboard" element={<CityDashboard />} />
          <Route path="/city-admin/complaints" element={<StaffComplaintsPage />} />
          <Route path="/city-admin/assign" element={<AssignComplaintsPage />} />
          <Route path="/city-admin/departments" element={<DepartmentManagePage />} />
          <Route path="/city-admin/staff" element={<StaffManagePage />} />
          <Route path="/city-admin/sla" element={<SLAManagePage />} />
          <Route path="/city-admin/reports" element={<ReportsPage />} />
          <Route path="/city-admin/settings" element={<DepartmentManagePage />} />
        </Route>
      </Route>

      {/* SUPER ADMIN PROTECTED ROUTES */}
      <Route element={<ProtectedRoute allowedRoles={['super_admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/super-admin/dashboard" element={<SuperDashboard />} />
          <Route path="/super-admin/cities" element={<CityManagePage />} />
          <Route path="/super-admin/city-admins" element={<CityAdminManagePage />} />
          <Route path="/super-admin/complaints" element={<PublicFeedPage />} />
          <Route path="/super-admin/users" element={<CityAdminManagePage />} />
          <Route path="/super-admin/audit-logs" element={<AuditLogsPage />} />
        </Route>
      </Route>

      {/* 404 CATCH-ALL */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
