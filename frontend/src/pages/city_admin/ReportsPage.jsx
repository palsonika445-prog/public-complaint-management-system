import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { Download, FileSpreadsheet, Filter, CheckCircle, Clock } from 'lucide-react'

const ReportsPage = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  // CSV Filter states
  const [status, setStatus] = useState('')
  const [isOverdue, setIsOverdue] = useState('')

  const fetchAnalytics = async () => {
    try {
      const res = await api.get(`/reports/analytics?city_id=${user.city_id}`)
      setAnalytics(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const handleExportCSV = async () => {
    setExporting(true)
    try {
      const params = new URLSearchParams()
      params.append('city_id', user.city_id)
      if (status) params.append('status', status)
      if (isOverdue) params.append('is_overdue', isOverdue)

      const token = localStorage.getItem('pcms_token')
      const response = await fetch(`/api/reports/export-csv?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `PCMS_Report_${user.city_name || 'City'}_${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (err) {
      alert('Failed to export CSV report')
    } finally {
      setExporting(false)
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

  const summary = analytics?.summary || {}
  const categoryData = analytics?.by_category || []
  const departmentData = analytics?.by_department || []
  const priorityData = analytics?.by_priority || []

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#10b981']

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h4 className="fw-bold text-slate-900 mb-1">Civic Analytics & CSV Reports</h4>
          <p className="text-muted small mb-0">Performance metrics and downloadable datasets for {user.city_name}</p>
        </div>
        <button
          className="btn btn-civic btn-sm d-inline-flex align-items-center gap-1.5"
          onClick={handleExportCSV}
          disabled={exporting}
        >
          <Download size={15} />
          <span>{exporting ? 'Generating CSV...' : 'Download Full CSV Report'}</span>
        </button>
      </div>

      {/* Summary Row */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="civic-card p-3 border-start border-4 border-primary">
            <small className="text-muted text-uppercase fw-semibold">Total Complaints</small>
            <h3 className="fw-bold mb-0 text-slate-900">{summary.total || 0}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="civic-card p-3 border-start border-4 border-success">
            <small className="text-muted text-uppercase fw-semibold">Resolution Rate</small>
            <h3 className="fw-bold mb-0 text-success">{summary.resolution_rate || 0}%</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="civic-card p-3 border-start border-4 border-warning">
            <small className="text-muted text-uppercase fw-semibold">Pending Review</small>
            <h3 className="fw-bold mb-0 text-warning">{summary.pending || 0}</h3>
          </div>
        </div>
        <div className="col-md-3">
          <div className="civic-card p-3 border-start border-4 border-danger">
            <small className="text-muted text-uppercase fw-semibold">Overdue SLA Cases</small>
            <h3 className="fw-bold mb-0 text-danger">{summary.overdue || 0}</h3>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="row g-4 mb-4">
        {/* Category Breakdown Bar Chart */}
        <div className="col-lg-7">
          <div className="civic-card p-4 h-100">
            <h6 className="fw-bold text-slate-900 mb-3">Complaints by Category</h6>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={50} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0284c7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Priority Pie Chart */}
        <div className="col-lg-5">
          <div className="civic-card p-4 h-100">
            <h6 className="fw-bold text-slate-900 mb-3">Priority Distribution</h6>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* CSV Filter Options Card */}
      <div className="civic-card p-4">
        <h6 className="fw-bold text-slate-900 mb-3 d-flex align-items-center gap-2">
          <FileSpreadsheet size={18} className="text-primary" />
          Custom CSV Dataset Export
        </h6>
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label small fw-semibold">Filter by Status</label>
            <select className="form-select form-select-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label small fw-semibold">SLA Overdue Condition</label>
            <select className="form-select form-select-sm" value={isOverdue} onChange={(e) => setIsOverdue(e.target.value)}>
              <option value="">All Records</option>
              <option value="true">Overdue Complaints Only</option>
            </select>
          </div>
          <div className="col-md-4">
            <button
              className="btn btn-primary btn-sm w-100 d-inline-flex align-items-center justify-content-center gap-2 py-2"
              onClick={handleExportCSV}
              disabled={exporting}
            >
              <Download size={14} />
              <span>{exporting ? 'Generating...' : 'Export Filtered CSV'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportsPage
