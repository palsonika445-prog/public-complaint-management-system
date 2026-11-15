import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import StatusBadge from '../../components/StatusBadge'
import PriorityBadge from '../../components/PriorityBadge'
import { FileText, AlertTriangle, Search, Filter } from 'lucide-react'

const StaffComplaintsPage = () => {
  const { t } = useTranslation()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [overdueOnly, setOverdueOnly] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const fetchStaffComplaints = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.append('status', statusFilter)
      if (priorityFilter) params.append('priority', priorityFilter)
      if (overdueOnly) params.append('overdue', 'true')

      const res = await api.get(`/staff/complaints?${params.toString()}`)
      setComplaints(res.data.complaints)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStaffComplaints()
  }, [statusFilter, priorityFilter, overdueOnly])

  const filtered = complaints.filter(c =>
    !searchTerm ||
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.complaint_number.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h4 className="fw-bold text-slate-900 mb-1">Department Work Queue</h4>
          <p className="text-muted small mb-0">Complaints assigned to your department for investigation and resolution</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="civic-card p-3 mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-md-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light"><Search size={14} /></span>
              <input
                type="text"
                className="form-control"
                placeholder={t('common.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div className="col-md-3">
            <select
              className="form-select form-select-sm"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="col-md-2">
            <div className="form-check form-switch pt-1">
              <input
                className="form-check-input"
                type="checkbox"
                id="overdueSwitch"
                checked={overdueOnly}
                onChange={(e) => setOverdueOnly(e.target.checked)}
              />
              <label className="form-check-label small fw-semibold text-danger" htmlFor="overdueSwitch">
                Overdue Only
              </label>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="civic-card p-5 text-center text-muted">
          No complaints matching the criteria.
        </div>
      ) : (
        <div className="civic-table table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Complaint ID</th>
                <th>Title & Location</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>SLA Due</th>
                <th>Citizen Details</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td className="fw-bold text-primary small">{c.complaint_number}</td>
                  <td>
                    <div className="fw-semibold text-slate-900 small text-truncate" style={{ maxWidth: 220 }}>{c.title}</div>
                    <small className="text-muted d-block text-truncate" style={{ maxWidth: 220 }}>
                      📍 {c.address || c.landmark || 'Coordinates available'}
                    </small>
                  </td>
                  <td><span className="badge bg-light text-secondary border small">{c.category_name}</span></td>
                  <td><PriorityBadge priority={c.priority} /></td>
                  <td><StatusBadge status={c.status} /></td>
                  <td className="small">
                    {c.is_overdue ? (
                      <span className="text-danger fw-bold d-inline-flex align-items-center gap-1">
                        <AlertTriangle size={13} /> OVERDUE
                      </span>
                    ) : (
                      <span className="text-muted">{c.sla_target_hours}h SLA</span>
                    )}
                  </td>
                  <td className="small text-muted">
                    {c.is_anonymous ? (
                      <span className="badge bg-light text-secondary border">Anonymous</span>
                    ) : (
                      <span>{c.citizen_name || 'Registered Citizen'}</span>
                    )}
                  </td>
                  <td>
                    <Link to={`/staff/complaints/${c.id}`} className="btn btn-xs btn-primary py-1 px-2.5 small">
                      Action &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default StaffComplaintsPage
