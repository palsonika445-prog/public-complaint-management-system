import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'

const DashboardLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100 bg-slate-50">
      <Navbar />
      <div className="d-flex flex-grow-1">
        <Sidebar />
        <main className="flex-grow-1 p-3 p-md-4" style={{ minWidth: 0 }}>
          <div className="container-fluid">
            <Outlet />
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}

export default DashboardLayout
