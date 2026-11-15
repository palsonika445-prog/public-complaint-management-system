import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import StatCard from '../../components/StatCard'
import StatusBadge from '../../components/StatusBadge'
import PriorityBadge from '../../components/PriorityBadge'
import { FileText, Clock, AlertTriangle, CheckCircle, ShieldAlert, ArrowRight } from 'lucide-react'

const StaffDashboard = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStaffDashboard = async () => {
      try {
        const res = await api.get('/staff/dashboard')
        setData(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStaffDashboard()
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

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2 bg-white p-4 rounded-4 shadow-sm border">
        <div>
          <h4 className="fw-bold text-slate-900 mb-1">
            Department Staff Dashboard
          </h4>
          <p className="text-muted small mb-0">
            {user?.full_name} &bull; <strong>{user?.department_name || 'Assigned Department'}</strong> ({user?.city_name})
          </p>
        </div>
        <Link to="/staff/complaints" className="btn btn-civic btn-sm d-inline-flex align-items-center gap-1.5">
          <FileText size={16} />
          <span>View Assigned Queue</span>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Total Assigned"
            value={stats.total_assigned || 0}
            icon={FileText}
            color="blue"
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="New Assignments"
            value={stats.new_assignments || 0}
            icon={Clock}
            color="amber"
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="In Progress"
            value={stats.in_progress || 0}
            icon={AlertTriangle}
            color="purple"
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Overdue SLA"
            value={stats.overdue || 0}
            icon={ShieldAlert}
            color="red"
          />
        </div>
      </div>

      {/* Priority Breakdown & Recent Queue */}
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="civic-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-slate-900 mb-0">Recent Actionable Queue</h5>
              <Link to="/staff/complaints" className="btn btn-sm btn-link text-primary text-decoration-none fw-semibold">
                View All &rarr;
              </Link>
            </div>

            {data?.recent_complaints?.length === 0 ? (
              <p className="text-muted small text-center py-4">No complaints in your department queue.</p>
            ) : (
              <div className="civic-table table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.recent_complaints?.map((c) => (
                      <tr key={c.id}>
                        <td className="fw-bold text-primary small">{c.complaint_number}</td>
                        <td>
                          <div className="fw-semibold text-truncate small" style={{ maxWidth: 220 }}>{c.title}</div>
                          {c.landmark && <small className="text-muted text-truncate d-block">📍 {c.landmark}</small>}
                        </td>
                        <td><PriorityBadge priority={c.priority} /></td>
                        <td><StatusBadge status={c.status} /></td>
                        <td>
                          <Link to={`/staff/complaints/${c.id}`} className="btn btn-xs btn-primary py-1 px-2.5 small">
                            Update
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Priority Summary */}
        <div className="col-lg-4">
          <div className="civic-card p-4 h-100">
            <h5 className="fw-bold text-slate-900 mb-3">Priority Distribution</h5>
            <div className="d-flex flex-column gap-3">
              <div className="p-3 bg-red-50 rounded-3 border border-red-200 d-flex justify-content-between align-items-center">
                <div>
                  <span className="badge bg-danger text-white mb-1">CRITICAL (12h)</span>
                  <div className="small text-muted">Immediate hazard</div>
                </div>
                <h4 className="fw-bold text-danger mb-0">{stats.priority_distribution?.critical || 0}</h4>
              </div>

              <div className="p-3 bg-amber-50 rounded-3 border border-amber-200 d-flex justify-content-between align-items-center">
                <div>
                  <span className="badge bg-warning text-dark mb-1">HIGH (24h)</span>
                  <div className="small text-muted">Severe infrastructure issue</div>
                </div>
                <h4 className="fw-bold text-warning mb-0">{stats.priority_distribution?.high || 0}</h4>
              </div>

              <div className="p-3 bg-blue-50 rounded-3 border border-blue-200 d-flex justify-content-between align-items-center">
                <div>
                  <span className="badge bg-info text-white mb-1">MEDIUM (72h)</span>
                  <div className="small text-muted">Standard repair queue</div>
                </div>
                <h4 className="fw-bold text-primary mb-0">{stats.priority_distribution?.medium || 0}</h4>
              </div>

              <div className="p-3 bg-emerald-50 rounded-3 border border-emerald-200 d-flex justify-content-between align-items-center">
                <div>
                  <span className="badge bg-success text-white mb-1">LOW (120h)</span>
                  <div className="small text-muted">Routine beautification</div>
                </div>
                <h4 className="fw-bold text-success mb-0">{stats.priority_distribution?.low || 0}</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StaffDashboard
