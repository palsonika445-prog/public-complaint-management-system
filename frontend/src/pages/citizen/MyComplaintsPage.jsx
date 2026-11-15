import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import StatusBadge from '../../components/StatusBadge'
import PriorityBadge from '../../components/PriorityBadge'
import { FileText, PlusCircle, Search, Calendar, Clock, AlertTriangle } from 'lucide-react'

const MyComplaintsPage = () => {
  const { t } = useTranslation()
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchMyComplaints = async () => {
      try {
        const res = await api.get('/citizen/complaints')
        setComplaints(res.data.complaints)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchMyComplaints()
  }, [])

  const filteredComplaints = complaints.filter(c => {
    const matchesStatus = !statusFilter || c.status === statusFilter
    const matchesSearch = !searchTerm ||
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.complaint_number.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h4 className="fw-bold text-slate-900 mb-1">{t('nav.myComplaints')}</h4>
          <p className="text-muted small mb-0">Track all public and private complaints registered by your account</p>
        </div>
        <Link to="/citizen/submit" className="btn btn-civic btn-sm d-inline-flex align-items-center gap-1.5">
          <PlusCircle size={15} />
          <span>{t('nav.fileComplaint')}</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="civic-card p-3 mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-md-6">
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
          <div className="col-md-4">
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
          <div className="col-md-2 text-end text-muted small">
            {filteredComplaints.length} complaint(s)
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="civic-card p-5 text-center">
          <p className="text-muted mb-3">{t('dashboard.noComplaints')}</p>
          <Link to="/citizen/submit" className="btn btn-outline-primary btn-sm">
            {t('nav.fileComplaint')}
          </Link>
        </div>
      ) : (
        <div className="civic-table table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Complaint ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assigned Dept</th>
                <th>SLA Due</th>
                <th>Submitted</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map((c) => (
                <tr key={c.id}>
                  <td className="fw-bold text-primary small">{c.complaint_number}</td>
                  <td>
                    <div className="fw-semibold text-slate-800 text-truncate" style={{ maxWidth: 220 }}>{c.title}</div>
                    {c.landmark && <small className="text-muted text-truncate d-block" style={{ maxWidth: 220 }}>📍 {c.landmark}</small>}
                  </td>
                  <td><span className="badge bg-light text-secondary border small">{c.category_name}</span></td>
                  <td><PriorityBadge priority={c.priority} /></td>
                  <td><StatusBadge status={c.status} /></td>
                  <td className="small text-secondary">{c.assigned_department_name || 'Pending'}</td>
                  <td className="small">
                    {c.is_overdue ? (
                      <span className="text-danger fw-semibold d-inline-flex align-items-center gap-1">
                        <AlertTriangle size={13} /> Overdue
                      </span>
                    ) : (
                      <span className="text-muted">{c.sla_target_hours}h target</span>
                    )}
                  </td>
                  <td className="small text-muted">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/complaints/${c.id}`} className="btn btn-xs btn-outline-primary py-1 px-2.5 small">
                      {t('common.viewDetails')}
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

export default MyComplaintsPage
