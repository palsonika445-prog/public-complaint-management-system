import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import StatusBadge from '../../components/StatusBadge'
import PriorityBadge from '../../components/PriorityBadge'
import { FileText, AlertTriangle, Search, Filter, ShieldAlert, CheckCircle, ArrowRight } from 'lucide-react'

const CityComplaintsPage = () => {
  const { t } = useTranslation()
  const [complaints, setComplaints] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [overdueOnly, setOverdueOnly] = useState(false)

  const fetchComplaints = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('q', searchTerm)
      if (statusFilter) params.append('status', statusFilter)
      if (priorityFilter) params.append('priority', priorityFilter)
      if (deptFilter) params.append('department_id', deptFilter)
      if (overdueOnly) params.append('overdue', 'true')

      const res = await api.get(`/admin/city/complaints?${params.toString()}`)
      setComplaints(res.data.complaints || [])
    } catch (err) {
      console.error('Failed to load city complaints', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const res = await api.get('/departments')
        setDepartments(res.data.departments || [])
      } catch (e) {
        console.error(e)
      }
    }
    fetchMetadata()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchComplaints()
    }, 250)
    return () => clearTimeout(timer)
  }, [searchTerm, statusFilter, priorityFilter, deptFilter, overdueOnly])

  return (
    <div>
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h4 className="fw-bold text-slate-900 mb-1">Municipal Complaints Directory</h4>
          <p className="text-muted small mb-0">
            Oversee and search all civic complaints across departments in your municipal corporation
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link to="/city-admin/assign" className="btn btn-civic btn-sm d-inline-flex align-items-center gap-1.5 shadow-sm">
            <CheckCircle size={15} />
            <span>Allocation Queue</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="civic-card p-3 mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-md-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light"><Search size={14} /></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by ID, keyword, landmark, address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button className="btn btn-outline-secondary" type="button" onClick={() => setSearchTerm('')}>
                  &times;
                </button>
              )}
            </div>
          </div>

          <div className="col-md-2">
            <select
              className="form-select form-select-sm"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
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
              <option value="reopened">Reopened</option>
              <option value="rejected">Rejected</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="col-md-2">
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

          <div className="col-md-2 d-flex align-items-center justify-content-end">
            <div className="form-check form-switch mb-0">
              <input
                className="form-check-input"
                type="checkbox"
                id="overdueOnly"
                checked={overdueOnly}
                onChange={(e) => setOverdueOnly(e.target.checked)}
              />
              <label className="form-check-label small fw-semibold text-danger ms-1" htmlFor="overdueOnly">
                Overdue Only
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Complaints Table */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : complaints.length === 0 ? (
        <div className="civic-card p-5 text-center">
          <FileText size={36} className="text-muted mb-2" />
          <h6 className="fw-semibold text-slate-800">No complaints matching the criteria</h6>
          <p className="text-muted small mb-0">Try clearing search filters or check another department</p>
        </div>
      ) : (
        <div className="civic-table table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Complaint ID</th>
                <th>Title & Location</th>
                <th>Category</th>
                <th>Assigned Dept</th>
                <th>Staff</th>
                <th>Priority</th>
                <th>Status</th>
                <th>SLA Due</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c.id}>
                  <td className="fw-bold text-primary small">
                    <Link to={`/complaints/${c.id}`} className="text-decoration-none">
                      {c.complaint_number}
                    </Link>
                  </td>
                  <td>
                    <div className="fw-semibold text-slate-800 text-truncate" style={{ maxWidth: 220 }} title={c.title}>
                      {c.title}
                    </div>
                    {c.landmark && (
                      <small className="text-muted text-truncate d-block" style={{ maxWidth: 220 }}>
                        📍 {c.landmark}
                      </small>
                    )}
                  </td>
                  <td>
                    <span className="badge bg-light text-secondary border small">{c.category_name}</span>
                  </td>
                  <td className="small text-slate-700">
                    {c.assigned_department_name ? (
                      <span className="badge bg-light text-dark border">{c.assigned_department_name}</span>
                    ) : (
                      <span className="badge bg-warning text-dark">Unallocated</span>
                    )}
                  </td>
                  <td className="small text-muted">
                    {c.assigned_staff_name || 'Unassigned'}
                  </td>
                  <td>
                    <PriorityBadge priority={c.priority} />
                  </td>
                  <td>
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="small">
                    {c.is_overdue ? (
                      <span className="text-danger fw-bold d-inline-flex align-items-center gap-1">
                        <ShieldAlert size={14} /> Overdue
                      </span>
                    ) : (
                      <span className="text-muted">{c.sla_target_hours ? `${c.sla_target_hours}h` : 'N/A'}</span>
                    )}
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-1.5">
                      <Link to={`/complaints/${c.id}`} className="btn btn-xs btn-outline-primary py-1 px-2 small">
                        View
                      </Link>
                      {(!c.assigned_department_id || c.status === 'submitted') && (
                        <Link to="/city-admin/assign" className="btn btn-xs btn-primary py-1 px-2 small">
                          Assign
                        </Link>
                      )}
                    </div>
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

export default CityComplaintsPage
