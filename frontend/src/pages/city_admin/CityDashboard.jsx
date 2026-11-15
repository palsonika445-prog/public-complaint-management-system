import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import StatCard from '../../components/StatCard'
import StatusBadge from '../../components/StatusBadge'
import PriorityBadge from '../../components/PriorityBadge'
import {
  Building2,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
  ShieldAlert,
  ArrowRight,
  Play
} from 'lucide-react'

const CityDashboard = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checkingSla, setCheckingSla] = useState(false)
  const [slaAlertMsg, setSlaAlertMsg] = useState(null)

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/admin/city/dashboard')
      setData(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const handleRunSlaCheck = async () => {
    setCheckingSla(true)
    try {
      const res = await api.post('/admin/city/run-sla-check')
      setSlaAlertMsg(res.data.message)
      fetchDashboard()
    } catch (err) {
      setSlaAlertMsg('Failed to run SLA check.')
    } finally {
      setCheckingSla(false)
    }
  }

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
  const city = data?.city || {}

  return (
    <div>
      {/* City Admin Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2 bg-white p-4 rounded-4 shadow-sm border">
        <div>
          <h4 className="fw-bold text-slate-900 mb-1">
            {city.name} &bull; Municipal Dashboard
          </h4>
          <p className="text-muted small mb-0">
            {city.state}, India &bull; Helpline: {city.helpline_number || 'N/A'} &bull; Administrator: {user?.full_name}
          </p>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-1.5"
            onClick={handleRunSlaCheck}
            disabled={checkingSla}
          >
            <Play size={14} />
            <span>{checkingSla ? 'Evaluating SLAs...' : 'Trigger SLA Check'}</span>
          </button>
          <Link to="/city-admin/assign" className="btn btn-civic btn-sm d-inline-flex align-items-center gap-1.5">
            <CheckCircle size={15} />
            <span>Assign Incoming Cases</span>
          </Link>
        </div>
      </div>

      {slaAlertMsg && (
        <div className="alert alert-info py-2 px-3 small d-flex justify-content-between align-items-center mb-4">
          <span>{slaAlertMsg}</span>
          <button type="button" className="btn-close btn-sm" onClick={() => setSlaAlertMsg(null)} />
        </div>
      )}

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title={t('dashboard.totalComplaints')}
            value={stats.total_complaints || 0}
            icon={FileText}
            color="blue"
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title="Pending Allocation"
            value={stats.pending || 0}
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
            title="Overdue SLA Cases"
            value={stats.overdue || 0}
            icon={ShieldAlert}
            color="red"
          />
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Pending Review Table */}
        <div className="col-lg-7">
          <div className="civic-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-slate-900 mb-0">Incoming Complaints (Needs Assignment)</h5>
              <Link to="/city-admin/assign" className="btn btn-sm btn-link text-primary text-decoration-none fw-semibold">
                Allocation Queue &rarr;
              </Link>
            </div>

            {data?.pending_review?.length === 0 ? (
              <p className="text-muted small text-center py-4">No pending complaints awaiting assignment.</p>
            ) : (
              <div className="civic-table table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Priority</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.pending_review?.map((c) => (
                      <tr key={c.id}>
                        <td className="fw-bold text-primary small">{c.complaint_number}</td>
                        <td>
                          <div className="fw-semibold text-slate-900 small text-truncate" style={{ maxWidth: 200 }}>{c.title}</div>
                          {c.landmark && <small className="text-muted text-truncate d-block">📍 {c.landmark}</small>}
                        </td>
                        <td><span className="badge bg-light text-secondary border small">{c.category_name}</span></td>
                        <td><PriorityBadge priority={c.priority} /></td>
                        <td>
                          <Link to={`/city-admin/assign?complaint_id=${c.id}`} className="btn btn-xs btn-primary py-1 px-2.5 small">
                            Assign &rarr;
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

        {/* Department Performance Table */}
        <div className="col-lg-5">
          <div className="civic-card p-4 h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-slate-900 mb-0">Department Performance</h5>
              <Link to="/city-admin/departments" className="btn btn-sm btn-link text-primary text-decoration-none fw-semibold">
                Manage &rarr;
              </Link>
            </div>

            <div className="d-flex flex-column gap-2.5">
              {data?.department_stats?.map((dept) => (
                <div key={dept.id} className="p-3 border rounded-3 bg-light d-flex justify-content-between align-items-center">
                  <div>
                    <span className="badge bg-slate-800 text-white small me-1.5">{dept.code}</span>
                    <strong className="text-slate-800 small">{dept.name}</strong>
                    <div className="small text-muted mt-1">
                      {dept.staff_count} staff &bull; {dept.resolved_complaints} of {dept.total_complaints} resolved
                    </div>
                  </div>
                  <div className="text-end">
                    {dept.overdue_complaints > 0 ? (
                      <span className="badge bg-danger text-white small">{dept.overdue_complaints} Overdue</span>
                    ) : (
                      <span className="badge bg-success text-white small">On Track</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CityDashboard
