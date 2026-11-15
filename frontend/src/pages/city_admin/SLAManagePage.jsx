import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Clock, ShieldAlert, CheckCircle, Save, AlertTriangle } from 'lucide-react'

const SLAManagePage = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [policies, setPolicies] = useState([])
  const [escalations, setEscalations] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingPriority, setSavingPriority] = useState(null)
  const [successMsg, setSuccessMsg] = useState(null)

  // Policy form edits
  const [policyForm, setPolicyForm] = useState({
    critical: { target: 12, esc: 8 },
    high: { target: 24, esc: 18 },
    medium: { target: 72, esc: 48 },
    low: { target: 120, esc: 96 },
  })

  const fetchData = async () => {
    try {
      const [slaRes, escRes] = await Promise.all([
        api.get('/admin/city/sla-policies'),
        api.get('/admin/city/escalations')
      ])
      setPolicies(slaRes.data.sla_policies)
      setEscalations(resEsc => escRes.data.escalations)

      // Map existing policies to state
      const formUpdate = { ...policyForm }
      slaRes.data.sla_policies.forEach((p) => {
        const pr = p.priority.toLowerCase()
        if (formUpdate[pr]) {
          formUpdate[pr] = {
            target: p.target_resolution_hours,
            esc: p.escalation_threshold_hours,
          }
        }
      })
      setPolicyForm(formUpdate)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSavePolicy = async (priorityKey) => {
    setSavingPriority(priorityKey)
    try {
      const config = policyForm[priorityKey]
      await api.post('/admin/city/sla-policies', {
        priority: priorityKey,
        target_resolution_hours: parseInt(config.target),
        escalation_threshold_hours: parseInt(config.esc),
      })
      setSuccessMsg(`SLA target for ${priorityKey.toUpperCase()} updated successfully!`)
      fetchData()
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update SLA policy')
    } finally {
      setSavingPriority(null)
    }
  }

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold text-slate-900 mb-1">Service Level Agreement (SLA) & Escalation Policies</h4>
        <p className="text-muted small mb-0">Configure resolution targets and automatic escalation thresholds for {user.city_name}</p>
      </div>

      {successMsg && (
        <div className="alert alert-success py-2 px-3 small mb-4">{successMsg}</div>
      )}

      {/* SLA Policy Grid */}
      <div className="row g-3 mb-5">
        {/* Critical */}
        <div className="col-md-6 col-lg-3">
          <div className="civic-card p-4 border-2 border-danger h-100">
            <span className="badge bg-danger text-white mb-2">CRITICAL PRIORITY</span>
            <h6 className="fw-bold text-slate-900 mb-3">Emergency Response</h6>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Resolution Target (Hours)</label>
              <input
                type="number"
                className="form-control form-control-sm"
                value={policyForm.critical.target}
                onChange={(e) => setPolicyForm({
                  ...policyForm,
                  critical: { ...policyForm.critical, target: e.target.value }
                })}
              />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Escalation Trigger (Hours)</label>
              <input
                type="number"
                className="form-control form-control-sm"
                value={policyForm.critical.esc}
                onChange={(e) => setPolicyForm({
                  ...policyForm,
                  critical: { ...policyForm.critical, esc: e.target.value }
                })}
              />
            </div>
            <button
              className="btn btn-sm btn-outline-danger w-100 d-inline-flex align-items-center justify-content-center gap-1"
              onClick={() => handleSavePolicy('critical')}
              disabled={savingPriority === 'critical'}
            >
              <Save size={14} />
              <span>{savingPriority === 'critical' ? 'Saving...' : 'Update SLA'}</span>
            </button>
          </div>
        </div>

        {/* High */}
        <div className="col-md-6 col-lg-3">
          <div className="civic-card p-4 border-2 border-warning h-100">
            <span className="badge bg-warning text-dark mb-2">HIGH PRIORITY</span>
            <h6 className="fw-bold text-slate-900 mb-3">Major Hazard</h6>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Resolution Target (Hours)</label>
              <input
                type="number"
                className="form-control form-control-sm"
                value={policyForm.high.target}
                onChange={(e) => setPolicyForm({
                  ...policyForm,
                  high: { ...policyForm.high, target: e.target.value }
                })}
              />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Escalation Trigger (Hours)</label>
              <input
                type="number"
                className="form-control form-control-sm"
                value={policyForm.high.esc}
                onChange={(e) => setPolicyForm({
                  ...policyForm,
                  high: { ...policyForm.high, esc: e.target.value }
                })}
              />
            </div>
            <button
              className="btn btn-sm btn-outline-warning text-dark w-100 d-inline-flex align-items-center justify-content-center gap-1"
              onClick={() => handleSavePolicy('high')}
              disabled={savingPriority === 'high'}
            >
              <Save size={14} />
              <span>{savingPriority === 'high' ? 'Saving...' : 'Update SLA'}</span>
            </button>
          </div>
        </div>

        {/* Medium */}
        <div className="col-md-6 col-lg-3">
          <div className="civic-card p-4 border-2 border-info h-100">
            <span className="badge bg-info text-white mb-2">MEDIUM PRIORITY</span>
            <h6 className="fw-bold text-slate-900 mb-3">Standard Maintenance</h6>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Resolution Target (Hours)</label>
              <input
                type="number"
                className="form-control form-control-sm"
                value={policyForm.medium.target}
                onChange={(e) => setPolicyForm({
                  ...policyForm,
                  medium: { ...policyForm.medium, target: e.target.value }
                })}
              />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Escalation Trigger (Hours)</label>
              <input
                type="number"
                className="form-control form-control-sm"
                value={policyForm.medium.esc}
                onChange={(e) => setPolicyForm({
                  ...policyForm,
                  medium: { ...policyForm.medium, esc: e.target.value }
                })}
              />
            </div>
            <button
              className="btn btn-sm btn-outline-info text-dark w-100 d-inline-flex align-items-center justify-content-center gap-1"
              onClick={() => handleSavePolicy('medium')}
              disabled={savingPriority === 'medium'}
            >
              <Save size={14} />
              <span>{savingPriority === 'medium' ? 'Saving...' : 'Update SLA'}</span>
            </button>
          </div>
        </div>

        {/* Low */}
        <div className="col-md-6 col-lg-3">
          <div className="civic-card p-4 border-2 border-success h-100">
            <span className="badge bg-success text-white mb-2">LOW PRIORITY</span>
            <h6 className="fw-bold text-slate-900 mb-3">Routine / Aesthetics</h6>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Resolution Target (Hours)</label>
              <input
                type="number"
                className="form-control form-control-sm"
                value={policyForm.low.target}
                onChange={(e) => setPolicyForm({
                  ...policyForm,
                  low: { ...policyForm.low, target: e.target.value }
                })}
              />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold text-muted">Escalation Trigger (Hours)</label>
              <input
                type="number"
                className="form-control form-control-sm"
                value={policyForm.low.esc}
                onChange={(e) => setPolicyForm({
                  ...policyForm,
                  low: { ...policyForm.low, esc: e.target.value }
                })}
              />
            </div>
            <button
              className="btn btn-sm btn-outline-success w-100 d-inline-flex align-items-center justify-content-center gap-1"
              onClick={() => handleSavePolicy('low')}
              disabled={savingPriority === 'low'}
            >
              <Save size={14} />
              <span>{savingPriority === 'low' ? 'Saving...' : 'Update SLA'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Escalation Events Log */}
      <div className="civic-card p-4">
        <h5 className="fw-bold text-slate-900 mb-3 d-flex align-items-center gap-2">
          <ShieldAlert size={20} className="text-danger" />
          Escalation Audit Events
        </h5>

        {escalations.length === 0 ? (
          <p className="text-muted small text-center py-4 mb-0">No overdue escalation events recorded.</p>
        ) : (
          <div className="civic-table table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>Complaint ID</th>
                  <th>Reason</th>
                  <th>Escalation Level</th>
                  <th>Escalated Officer</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {escalations.map((ev) => (
                  <tr key={ev.id}>
                    <td className="small text-muted">{ev.id}</td>
                    <td className="fw-bold text-primary small">{ev.complaint_number || `ID ${ev.complaint_id}`}</td>
                    <td className="small text-danger fw-semibold">{ev.reason}</td>
                    <td><span className="badge bg-danger text-white small">Level {ev.level}</span></td>
                    <td className="small text-muted">{ev.escalated_to_name || 'Department Supervisor'}</td>
                    <td className="small text-muted">{new Date(ev.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default SLAManagePage
