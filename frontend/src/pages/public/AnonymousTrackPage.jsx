import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import StatusBadge from '../../components/StatusBadge'
import PriorityBadge from '../../components/PriorityBadge'
import Timeline from '../../components/Timeline'
import { Search, ShieldCheck, AlertCircle, Key, FileText, Calendar, Building } from 'lucide-react'

const AnonymousTrackPage = () => {
  const { t } = useTranslation()
  const [complaintNumber, setComplaintNumber] = useState('')
  const [trackingToken, setTrackingToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)

  const handleTrack = async (e) => {
    e.preventDefault()
    setError(null)
    setResult(null)
    setLoading(true)

    try {
      const res = await api.post('/complaints/anonymous-track', {
        complaint_number: complaintNumber.trim(),
        tracking_token: trackingToken.trim(),
      })
      setResult(res.data.complaint)
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid complaint ID or tracking token.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemoAnon = () => {
    setComplaintNumber('CMP-2026-000004')
    setTrackingToken('DEMO-ANON-TOKEN-2026')
    setError(null)
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-7">
          <div className="civic-card p-4 p-md-5 shadow-sm mb-4">
            <div className="text-center mb-4">
              <div className="p-3 bg-sky-50 text-primary rounded-circle d-inline-flex mb-2">
                <Search size={28} />
              </div>
              <h3 className="fw-bold text-slate-900">{t('nav.trackAnonymous')}</h3>
              <p className="text-muted small">{t('anonymous.enterDetails')}</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleTrack}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">{t('anonymous.complaintIdLabel')}</label>
                <div className="input-group">
                  <span className="input-group-text bg-light"><FileText size={16} /></span>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="e.g. CMP-2026-000004"
                    value={complaintNumber}
                    onChange={(e) => setComplaintNumber(e.target.value)}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">{t('anonymous.tokenLabel')}</label>
                <div className="input-group">
                  <span className="input-group-text bg-light"><Key size={16} /></span>
                  <input
                    type="text"
                    className="form-control"
                    required
                    placeholder="Enter the 32-character secret token provided at submission"
                    value={trackingToken}
                    onChange={(e) => setTrackingToken(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-civic w-100 py-2.5 fw-semibold shadow-sm mb-3"
                disabled={loading}
              >
                {loading ? 'Verifying Credentials...' : t('anonymous.trackButton')}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  className="btn btn-link btn-xs p-0 text-muted small text-decoration-none"
                  onClick={fillDemoAnon}
                >
                  ⚡ Autofill Sample Anonymous Complaint (CMP-2026-000004)
                </button>
              </div>
            </form>
          </div>

          {/* Result Card */}
          {result && (
            <div className="civic-card p-4 shadow-sm border-2 border-primary">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <span className="badge bg-primary text-white fw-bold px-2 py-1 mb-1 d-inline-block">
                    {result.complaint_number}
                  </span>
                  <h5 className="fw-bold text-slate-900 mb-0">{result.title}</h5>
                  <small className="text-muted">{result.city_name} &bull; {result.category_name}</small>
                </div>
                <StatusBadge status={result.status} />
              </div>

              <div className="bg-slate-50 p-3 rounded-3 border small mb-3">
                <p className="mb-2"><strong>Description:</strong> {result.description}</p>
                {result.landmark && <p className="mb-1 text-muted">📍 Landmark: {result.landmark}</p>}
                <div className="d-flex align-items-center gap-3 text-muted">
                  <span>Priority: <PriorityBadge priority={result.priority} /></span>
                  <span>SLA: {result.sla_target_hours}h target</span>
                </div>
              </div>

              {result.resolution_remarks && (
                <div className="alert alert-success p-3 small mb-3">
                  <strong>Resolution Remarks:</strong> {result.resolution_remarks}
                </div>
              )}

              {/* Status Timeline */}
              <div className="pt-2 border-top">
                <h6 className="fw-bold text-slate-800 small text-uppercase mb-3">Resolution Timeline</h6>
                <Timeline items={result.status_history || []} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AnonymousTrackPage
