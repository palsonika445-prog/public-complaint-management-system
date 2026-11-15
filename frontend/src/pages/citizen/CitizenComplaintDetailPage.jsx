import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import StatusBadge from '../../components/StatusBadge'
import PriorityBadge from '../../components/PriorityBadge'
import Timeline from '../../components/Timeline'
import ResolutionEvidenceCard from '../../components/ResolutionEvidenceCard'
import GrievanceReceiptModal from '../../components/GrievanceReceiptModal'
import WhatsAppNotificationToast from '../../components/WhatsAppNotificationToast'
import { ArrowLeft, Star, AlertTriangle, CheckCircle, RefreshCcw, MapPin, Calendar, Clock, Image as ImageIcon, ShieldCheck, Printer, MessageSquare } from 'lucide-react'

const CitizenComplaintDetailPage = () => {
  const { id } = useParams()
  const { t } = useTranslation()
  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [showWhatsAppToast, setShowWhatsAppToast] = useState(false)

  // Feedback Modal state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [rating, setRating] = useState(5)
  const [feedbackRemarks, setFeedbackRemarks] = useState('')
  const [timely, setTimely] = useState(true)
  const [staffBehavior, setStaffBehavior] = useState(true)
  const [submittingFeedback, setSubmittingFeedback] = useState(false)

  // Reopen Modal state
  const [showReopenModal, setShowReopenModal] = useState(false)
  const [reopenReason, setReopenReason] = useState('')
  const [submittingReopen, setSubmittingReopen] = useState(false)

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/complaints/${id}`)
      setComplaint(res.data.complaint)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load complaint.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDetail()
  }, [id])

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault()
    setSubmittingFeedback(true)
    try {
      await api.post(`/complaints/${id}/feedback`, {
        rating,
        remarks: feedbackRemarks,
        timely_resolution: timely,
        staff_behavior: staffBehavior,
      })
      setShowFeedbackModal(false)
      fetchDetail()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to submit feedback')
    } finally {
      setSubmittingFeedback(false)
    }
  }

  const handleReopenSubmit = async (e) => {
    e.preventDefault()
    setSubmittingReopen(true)
    try {
      await api.post(`/complaints/${id}/reopen`, {
        reason: reopenReason,
      })
      setShowReopenModal(false)
      fetchDetail()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reopen complaint')
    } finally {
      setSubmittingReopen(false)
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
          <Link to="/citizen/complaints" className="btn btn-outline-primary btn-sm">
            Back to My Complaints
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-2">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <Link to="/citizen/complaints" className="btn btn-link text-decoration-none text-muted p-0 d-inline-flex align-items-center gap-1 small">
          <ArrowLeft size={14} />
          Back to My Complaints
        </Link>
        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm btn-outline-success d-inline-flex align-items-center gap-1.5 py-1 px-2.5 rounded-pill shadow-xs"
            style={{ fontSize: '0.78rem' }}
            onClick={() => setShowWhatsAppToast(true)}
          >
            <MessageSquare size={14} className="text-success" />
            <span>📲 WhatsApp Live Alert</span>
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline-dark d-inline-flex align-items-center gap-1.5 py-1 px-2.5 rounded-pill shadow-xs"
            style={{ fontSize: '0.78rem' }}
            onClick={() => setShowReceiptModal(true)}
          >
            <Printer size={14} />
            <span>🖨️ Official Receipt (पावती)</span>
          </button>
        </div>
      </div>

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
                  <span className="badge bg-light text-dark border small">
                    {complaint.visibility === 'private' ? 'Private' : 'Public'}
                  </span>
                  {complaint.citizen_is_aadhaar_verified && (
                    <span className="badge bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-pill px-2 py-1 small d-inline-flex align-items-center gap-1">
                      <ShieldCheck size={12} className="text-emerald-600" />
                      <span>DigiLocker Verified Citizen (98% Trust)</span>
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

            <div className="row g-3 mb-3 text-muted small">
              <div className="col-md-6">
                <strong>Assigned Department:</strong> {complaint.assigned_department_name || 'Under Review / Unassigned'}
              </div>
              <div className="col-md-6">
                <strong>Assigned Staff:</strong> {complaint.assigned_staff_name || 'Pending assignment'}
              </div>
              <div className="col-md-6">
                <strong>Address:</strong> {complaint.address || 'GPS Coordinates Provided'}
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
                <strong>Submitted On:</strong> {new Date(complaint.created_at).toLocaleString()}
              </div>
            </div>

            {/* Resolution Remarks */}
            {complaint.resolution_remarks && (
              <div className="alert alert-success p-3 rounded-3 mt-3">
                <h6 className="fw-bold text-success mb-1 d-flex align-items-center gap-1.5">
                  <CheckCircle size={16} />
                  Resolution Remarks from Municipal Authority
                </h6>
                <p className="small mb-0 text-slate-800">{complaint.resolution_remarks}</p>
                {complaint.resolved_at && (
                  <small className="text-muted d-block mt-1">
                    Resolved at: {new Date(complaint.resolved_at).toLocaleString()}
                  </small>
                )}
              </div>
            )}

            {/* Existing Feedback Banner */}
            {complaint.feedback && (
              <div className="alert alert-info p-3 rounded-3 mt-3">
                <h6 className="fw-bold mb-1">Your Submitted Feedback</h6>
                <div className="d-flex align-items-center gap-1 mb-1">
                  {[...Array(complaint.feedback.rating)].map((_, i) => (
                    <Star key={i} size={15} fill="#f59e0b" color="#f59e0b" />
                  ))}
                  <span className="small text-muted ms-1">({complaint.feedback.rating}/5)</span>
                </div>
                {complaint.feedback.remarks && (
                  <p className="small text-secondary mb-0">"{complaint.feedback.remarks}"</p>
                )}
              </div>
            )}

            {/* Attachments */}
            {complaint.attachments && complaint.attachments.length > 0 && (
              <div className="mt-4 pt-3 border-top">
                <h6 className="fw-semibold text-slate-800 small text-uppercase mb-2">Uploaded Evidence & Photos</h6>
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
                      <span>{att.original_name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Before & After Resolution Proof Evidence Card */}
          <ResolutionEvidenceCard complaint={complaint} />
        </div>

        {/* Sidebar Actions & Timeline */}
        <div className="col-lg-4">
          {/* Action Card for Resolved complaints */}
          {complaint.status === 'resolved' && (
            <div className="civic-card p-3 mb-4 text-center">
              <h6 className="fw-bold text-slate-900 mb-2">Action Required</h6>
              <p className="small text-muted mb-3">
                This issue was marked resolved. Please rate the quality of service or reopen if the problem persists.
              </p>
              <div className="d-grid gap-2">
                {!complaint.feedback && (
                  <button
                    className="btn btn-civic btn-sm d-inline-flex align-items-center justify-content-center gap-1.5"
                    onClick={() => setShowFeedbackModal(true)}
                  >
                    <Star size={15} />
                    <span>Rate Resolution & Feedback</span>
                  </button>
                )}
                <button
                  className="btn btn-outline-danger btn-sm d-inline-flex align-items-center justify-content-center gap-1.5"
                  onClick={() => setShowReopenModal(true)}
                >
                  <RefreshCcw size={14} />
                  <span>Reopen Complaint</span>
                </button>
              </div>
            </div>
          )}

          {/* Timeline Card */}
          <div className="civic-card p-3.5">
            <h6 className="fw-bold text-slate-900 mb-3 border-bottom pb-2">Status History</h6>
            <Timeline items={complaint.status_history || []} />
          </div>
        </div>
      </div>

      {/* FEEDBACK MODAL */}
      {showFeedbackModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">{t('feedback.title')}</h5>
                <button type="button" className="btn-close" onClick={() => setShowFeedbackModal(false)} />
              </div>
              <form onSubmit={handleFeedbackSubmit}>
                <div className="modal-body">
                  <div className="mb-3 text-center">
                    <label className="form-label small fw-semibold d-block">{t('feedback.rating')}</label>
                    <div className="d-flex justify-content-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={28}
                          style={{ cursor: 'pointer' }}
                          fill={star <= rating ? '#f59e0b' : 'none'}
                          color={star <= rating ? '#f59e0b' : '#94a3b8'}
                          onClick={() => setRating(star)}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">{t('feedback.timelyQuestion')}</label>
                    <div className="d-flex gap-3">
                      <div className="form-check">
                        <input className="form-check-input" type="radio" checked={timely} onChange={() => setTimely(true)} id="tYes" />
                        <label className="form-check-label small" htmlFor="tYes">Yes</label>
                      </div>
                      <div className="form-check">
                        <input className="form-check-input" type="radio" checked={!timely} onChange={() => setTimely(false)} id="tNo" />
                        <label className="form-check-label small" htmlFor="tNo">No</label>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">{t('feedback.behaviorQuestion')}</label>
                    <div className="d-flex gap-3">
                      <div className="form-check">
                        <input className="form-check-input" type="radio" checked={staffBehavior} onChange={() => setStaffBehavior(true)} id="bYes" />
                        <label className="form-check-label small" htmlFor="bYes">Yes</label>
                      </div>
                      <div className="form-check">
                        <input className="form-check-input" type="radio" checked={!staffBehavior} onChange={() => setStaffBehavior(false)} id="bNo" />
                        <label className="form-check-label small" htmlFor="bNo">No</label>
                      </div>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Comments</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder={t('feedback.remarksPlaceholder')}
                      value={feedbackRemarks}
                      onChange={(e) => setFeedbackRemarks(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowFeedbackModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-sm btn-primary" disabled={submittingFeedback}>
                    {submittingFeedback ? 'Submitting...' : t('feedback.submitFeedback')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* REOPEN MODAL */}
      {showReopenModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title fw-bold">{t('common.reopen')}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowReopenModal(false)} />
              </div>
              <form onSubmit={handleReopenSubmit}>
                <div className="modal-body">
                  <p className="small text-muted mb-3">
                    If the repair was incomplete or defective, describe what remains unresolved. A municipal supervisor will be alerted.
                  </p>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold text-danger">Reason for Reopening *</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      required
                      minLength={5}
                      placeholder="Specify why the resolution was unsatisfactory..."
                      value={reopenReason}
                      onChange={(e) => setReopenReason(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowReopenModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-sm btn-danger" disabled={submittingReopen}>
                    {submittingReopen ? 'Reopening...' : 'Confirm Reopen Complaint'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Official Grievance Acknowledgement Receipt Modal */}
      <GrievanceReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        complaint={complaint}
      />

      {/* WhatsApp Civic Notification Toast */}
      <WhatsAppNotificationToast
        complaint={complaint}
        show={showWhatsAppToast}
        onClose={() => setShowWhatsAppToast(false)}
      />
    </div>
  )
}

export default CitizenComplaintDetailPage
