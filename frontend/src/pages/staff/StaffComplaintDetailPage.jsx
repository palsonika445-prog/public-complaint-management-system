import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import StatusBadge from '../../components/StatusBadge'
import PriorityBadge from '../../components/PriorityBadge'
import Timeline from '../../components/Timeline'
import { ArrowLeft, CheckCircle2, AlertTriangle, Send, Upload, MapPin, Calendar, Clock, MessageSquare, Image as ImageIcon, ShieldCheck } from 'lucide-react'

const StaffComplaintDetailPage = () => {
  const { id } = useParams()
  const { t } = useTranslation()
  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Status transition states
  const [newStatus, setNewStatus] = useState('')
  const [statusRemarks, setStatusRemarks] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Fast resolve modal/state
  const [showResolveModal, setShowResolveModal] = useState(false)
  const [resolveRemarks, setResolveRemarks] = useState('')
  const [resolveEvidenceFile, setResolveEvidenceFile] = useState(null)
  const [resolving, setResolving] = useState(false)

  // Comment state
  const [newComment, setNewComment] = useState('')
  const [isInternalComment, setIsInternalComment] = useState(false)
  const [commenting, setCommenting] = useState(false)

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/complaints/${id}`)
      setComplaint(res.data.complaint)
      setNewStatus(res.data.complaint.status)
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to load complaint.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDetail()
  }, [id])

  const handleStatusChange = async (e) => {
    e.preventDefault()
    if (newStatus === 'resolved') {
      setShowResolveModal(true)
      return
    }

    setUpdatingStatus(true)
    try {
      await api.post(`/complaints/${id}/status`, {
        status: newStatus,
        remarks: statusRemarks,
      })
      setStatusRemarks('')
      fetchDetail()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleResolveSubmit = async (e) => {
    e.preventDefault()
    if (!resolveRemarks.trim()) {
      alert('Resolution remarks are mandatory.')
      return
    }

    setResolving(true)
    try {
      // 1. If photo attached, upload as resolution evidence
      let evidenceUrl = null
      if (resolveEvidenceFile) {
        const formData = new FormData()
        formData.append('file', resolveEvidenceFile)
        formData.append('is_resolution_evidence', 'true')
        formData.append('is_public', 'true')
        const attRes = await api.post(`/complaints/${id}/attachments`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        evidenceUrl = attRes.data.attachment?.download_url
      }

      // 2. Mark resolved
      await api.post(`/complaints/${id}/status`, {
        status: 'resolved',
        resolution_remarks: resolveRemarks,
        evidence_url: evidenceUrl,
      })

      setShowResolveModal(false)
      fetchDetail()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to resolve complaint.')
    } finally {
      setResolving(false)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setCommenting(true)
    try {
      await api.post(`/complaints/${id}/comments`, {
        comment: newComment,
        is_internal: isInternalComment,
      })
      setNewComment('')
      fetchDetail()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add comment')
    } finally {
      setCommenting(false)
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

  if (error || !complaint) {
    return (
      <div className="container py-5 text-center">
        <div className="civic-card p-4 max-w-md mx-auto" style={{ maxWidth: 500, margin: '0 auto' }}>
          <h5 className="text-danger fw-bold mb-2">Error</h5>
          <p className="text-muted small mb-3">{error}</p>
          <Link to="/staff/complaints" className="btn btn-outline-primary btn-sm">
            Back to Queue
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-2">
      <Link to="/staff/complaints" className="btn btn-link text-decoration-none text-muted p-0 mb-3 d-inline-flex align-items-center gap-1 small">
        <ArrowLeft size={14} />
        Back to Assigned Queue
      </Link>

      <div className="row g-4">
        {/* Main Details */}
        <div className="col-lg-8">
          <div className="civic-card p-4 mb-4">
            <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
              <div>
                <span className="badge bg-primary text-white fw-bold px-2.5 py-1 mb-2 d-inline-block">
                  {complaint.complaint_number}
                </span>
                <h4 className="fw-bold text-slate-900 mb-1">{complaint.title}</h4>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span className="badge bg-light text-secondary border small">{complaint.category_name}</span>
                  <span className="badge bg-light text-secondary border small">{complaint.city_name}</span>
                  <PriorityBadge priority={complaint.priority} />
                  {complaint.citizen_is_aadhaar_verified ? (
                    <span className="badge bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-pill px-2 py-0.5 small d-inline-flex align-items-center gap-1">
                      <ShieldCheck size={12} className="text-emerald-600" />
                      <span>Aadhaar Verified Citizen ({complaint.citizen_trust_score || 98}% Trust)</span>
                    </span>
                  ) : complaint.is_anonymous ? (
                    <span className="badge bg-light text-muted border rounded-pill px-2 py-0.5 small">
                      Anonymous Source
                    </span>
                  ) : (
                    <span className="badge bg-amber-50 text-amber-800 border border-amber-300 rounded-pill px-2 py-0.5 small">
                      Standard Citizen
                    </span>
                  )}
                  {complaint.is_overdue && (
                    <span className="badge bg-danger text-white d-inline-flex align-items-center gap-1">
                      <AlertTriangle size={12} /> OVERDUE
                    </span>
                  )}
                </div>
              </div>
              <StatusBadge status={complaint.status} />
            </div>

            <div className="mb-4">
              <h6 className="fw-semibold text-slate-800 small text-uppercase">Description</h6>
              <p className="text-secondary bg-slate-50 p-3 rounded-3 border">
                {complaint.description}
              </p>
            </div>

            <div className="row g-3 mb-4 text-muted small bg-light p-3 rounded-3 border">
              <div className="col-md-6">
                <strong>Citizen Name:</strong> {complaint.citizen_name || 'Anonymous Submitter'}
              </div>
              <div className="col-md-6">
                <strong>Address:</strong> {complaint.address || 'Location on map'}
              </div>
              {complaint.landmark && (
                <div className="col-md-6">
                  <strong>Landmark:</strong> {complaint.landmark}
                </div>
              )}
              <div className="col-md-6">
                <strong>Exact Coordinates:</strong> {complaint.latitude?.toFixed(5)}, {complaint.longitude?.toFixed(5)}
              </div>
              <div className="col-md-6">
                <strong>SLA Target:</strong> {complaint.sla_target_hours} hours
              </div>
              <div className="col-md-6">
                <strong>Due Date:</strong> {complaint.sla_due_at ? new Date(complaint.sla_due_at).toLocaleString() : 'N/A'}
              </div>
            </div>

            {/* Attachments */}
            {complaint.attachments && complaint.attachments.length > 0 && (
              <div className="mb-4 pt-3 border-top">
                <h6 className="fw-semibold text-slate-800 small text-uppercase mb-2">Uploaded Attachments</h6>
                <div className="d-flex flex-wrap gap-2">
                  {complaint.attachments.map((att) => (
                    <a
                      key={att.id}
                      href={att.download_url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5"
                    >
                      <ImageIcon size={14} />
                      <span>{att.original_name} {att.is_resolution_evidence && '(Evidence)'}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Comments & Notes Section */}
            <div className="pt-3 border-top">
              <h6 className="fw-bold text-slate-900 mb-3 d-flex align-items-center gap-1.5">
                <MessageSquare size={16} className="text-primary" />
                Case Notes & Updates
              </h6>

              {/* Add Comment Form */}
              <form onSubmit={handleAddComment} className="mb-4">
                <div className="mb-2">
                  <textarea
                    className="form-control form-control-sm"
                    rows={2}
                    required
                    placeholder="Add an internal note or citizen-visible progress update..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="form-check form-switch mb-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="internalSwitch"
                      checked={isInternalComment}
                      onChange={(e) => setIsInternalComment(e.target.checked)}
                    />
                    <label className="form-check-label small text-muted" htmlFor="internalSwitch">
                      Internal staff note (hidden from citizen)
                    </label>
                  </div>
                  <button type="submit" className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1" disabled={commenting}>
                    <Send size={13} />
                    <span>{commenting ? 'Posting...' : 'Post Note'}</span>
                  </button>
                </div>
              </form>

              {/* Comments Feed */}
              <div className="d-flex flex-column gap-2">
                {complaint.comments?.length === 0 ? (
                  <p className="text-muted small">No comments or notes yet.</p>
                ) : (
                  complaint.comments?.map((c) => (
                    <div
                      key={c.id}
                      className={`p-2.5 rounded-2 border small ${c.is_internal ? 'bg-amber-50 border-amber-200' : 'bg-slate-50'}`}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-semibold text-slate-900">
                          {c.author_name} ({c.author_role})
                          {c.is_internal && <span className="badge bg-warning text-dark ms-2">Internal Note</span>}
                        </span>
                        <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                          {new Date(c.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="mb-0 text-slate-700">{c.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls & Timeline */}
        <div className="col-lg-4">
          {/* Status Update Card */}
          <div className="civic-card p-3.5 mb-4">
            <h6 className="fw-bold text-slate-900 mb-3 border-bottom pb-2">Update Workflow Status</h6>
            <form onSubmit={handleStatusChange}>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Next Status</label>
                <select
                  className="form-select form-select-sm"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="under_review">Under Review</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress (Field Work)</option>
                  <option value="resolved">Mark Resolved</option>
                </select>
              </div>

              {newStatus !== 'resolved' && (
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Status Remarks</label>
                  <textarea
                    className="form-control form-control-sm"
                    rows={2}
                    placeholder="Brief remark on this transition..."
                    value={statusRemarks}
                    onChange={(e) => setStatusRemarks(e.target.value)}
                  />
                </div>
              )}

              <button
                type="submit"
                className={`btn btn-sm w-100 ${newStatus === 'resolved' ? 'btn-success' : 'btn-primary'}`}
                disabled={updatingStatus}
              >
                {newStatus === 'resolved' ? 'Proceed to Resolution' : 'Update Status'}
              </button>
            </form>
          </div>

          {/* Timeline Card */}
          <div className="civic-card p-3.5">
            <h6 className="fw-bold text-slate-900 mb-3 border-bottom pb-2">Status History</h6>
            <Timeline items={complaint.status_history || []} />
          </div>
        </div>
      </div>

      {/* RESOLVE MODAL */}
      {showResolveModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header bg-success text-white">
                <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                  <CheckCircle2 size={20} />
                  Mark Complaint Resolved
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowResolveModal(false)} />
              </div>
              <form onSubmit={handleResolveSubmit}>
                <div className="modal-body">
                  <p className="small text-muted mb-3">
                    Please provide detailed resolution remarks explaining the work completed. This will be shared with the citizen.
                  </p>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Resolution Remarks *</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      required
                      placeholder="e.g. Road surface patched with asphalt. Cleaned surrounding area."
                      value={resolveRemarks}
                      onChange={(e) => setResolveRemarks(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Upload Resolution Evidence (Optional)</label>
                    <input
                      type="file"
                      className="form-control form-control-sm"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => setResolveEvidenceFile(e.target.files[0])}
                    />
                    <small className="text-muted">Attach site photo verifying completion.</small>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowResolveModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-sm btn-success" disabled={resolving}>
                    {resolving ? 'Submitting Resolution...' : 'Confirm Resolution'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StaffComplaintDetailPage
