import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import { History, Shield, Clock } from 'lucide-react'

const AuditLogsPage = () => {
  const { t } = useTranslation()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/admin/super/audit-logs?page=${page}&per_page=15`)
      setLogs(res.data.audit_logs)
      setPages(res.data.pages)
      setTotal(res.data.total)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [page])

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold text-slate-900 mb-1">Administrative Audit Logs</h4>
        <p className="text-muted small mb-0">Immutable compliance record of sensitive governance actions, user creation, and status modifications</p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : logs.length === 0 ? (
        <div className="civic-card p-5 text-center text-muted">
          No audit logs recorded yet.
        </div>
      ) : (
        <div className="civic-card p-0 shadow-sm overflow-hidden mb-4">
          <div className="civic-table table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Actor</th>
                  <th>City</th>
                  <th>Entity</th>
                  <th>Details</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="small text-muted text-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td>
                      <span className="badge bg-slate-900 text-sky-400 font-monospace small">
                        {log.action}
                      </span>
                    </td>
                    <td className="small fw-semibold text-slate-800">{log.user_name}</td>
                    <td className="small text-muted">{log.city_name || 'Global'}</td>
                    <td className="small text-muted">{log.entity_type} #{log.entity_id || ''}</td>
                    <td className="small text-muted font-monospace" style={{ maxWidth: 260 }}>
                      <div className="text-truncate">
                        {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details || '—'}
                      </div>
                    </td>
                    <td className="small text-muted">{log.ip_address || '127.0.0.1'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-2">
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </button>
          <span className="small text-muted px-2">Page {page} of {pages} ({total} entries)</span>
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={page >= pages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default AuditLogsPage
