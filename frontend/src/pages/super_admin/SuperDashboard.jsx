import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import StatCard from '../../components/StatCard'
import {
  Building2,
  Users,
  FileText,
  CheckCircle,
  AlertTriangle,
  ShieldCheck,
  Globe,
  ArrowRight
} from 'lucide-react'

const SuperDashboard = () => {
  const { t } = useTranslation()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSuperDashboard = async () => {
      try {
        const res = await api.get('/admin/super/dashboard')
        setData(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchSuperDashboard()
  }, [])

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  const stats = data?.stats || {}
  const cityComparison = data?.city_comparison || []

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2 bg-slate-900 text-white p-4 rounded-4 shadow-sm border border-slate-800">
        <div>
          <span className="badge bg-sky-950 text-sky-400 border border-sky-800 px-3 py-1 mb-2">Platform Administration</span>
          <h4 className="fw-bold mb-1">Global Public Complaint Oversight</h4>
          <p className="text-slate-300 small mb-0">Multi-tenant civic infrastructure monitoring across Indian Municipalities</p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/super-admin/cities" className="btn btn-civic btn-sm d-inline-flex align-items-center gap-1.5">
            <Building2 size={15} />
            <span>Manage Cities</span>
          </Link>
          <Link to="/super-admin/city-admins" className="btn btn-outline-light btn-sm d-inline-flex align-items-center gap-1.5">
            <ShieldCheck size={15} />
            <span>City Admins</span>
          </Link>
        </div>
      </div>

      {/* Global Stat Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Registered Cities"
            value={stats.total_cities || 0}
            icon={Building2}
            color="blue"
            subtitle={`${stats.active_cities || 0} active corporations`}
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Registered Citizens"
            value={stats.total_citizens || 0}
            icon={Users}
            color="purple"
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Total Complaints"
            value={stats.total_complaints || 0}
            icon={FileText}
            color="amber"
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Global Resolution Rate"
            value={`${stats.global_resolution_rate || 0}%`}
            icon={CheckCircle}
            color="green"
            subtitle={`${stats.resolved || 0} resolved cases`}
          />
        </div>
      </div>

      {/* City-by-City Performance Table */}
      <div className="civic-card p-4 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold text-slate-900 mb-0">City-by-City Performance Analytics</h5>
          <Link to="/super-admin/cities" className="btn btn-sm btn-link text-primary text-decoration-none fw-semibold">
            All Cities &rarr;
          </Link>
        </div>

        <div className="civic-table table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>City / Corporation</th>
                <th>State</th>
                <th>Departments</th>
                <th>Total Reports</th>
                <th>Resolved</th>
                <th>Overdue</th>
                <th>Resolution Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {cityComparison.map((c) => (
                <tr key={c.id}>
                  <td className="fw-bold text-slate-900 small">{c.name}</td>
                  <td className="small text-muted">{c.state}</td>
                  <td className="small">{c.departments_count} Depts</td>
                  <td className="small fw-semibold">{c.total_complaints}</td>
                  <td className="small text-success fw-semibold">{c.resolved_complaints}</td>
                  <td className="small">
                    {c.overdue_complaints > 0 ? (
                      <span className="badge bg-danger text-white">{c.overdue_complaints} Overdue</span>
                    ) : (
                      <span className="text-muted">0</span>
                    )}
                  </td>
                  <td className="small">
                    <div className="d-flex align-items-center gap-2">
                      <div className="progress flex-grow-1" style={{ height: 6 }}>
                        <div
                          className="progress-bar bg-success"
                          role="progressbar"
                          style={{ width: `${c.resolution_rate}%` }}
                        />
                      </div>
                      <span className="fw-semibold">{c.resolution_rate}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${c.is_active ? 'bg-success' : 'bg-secondary'} text-white small`}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default SuperDashboard
