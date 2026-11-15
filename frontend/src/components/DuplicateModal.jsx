import React from 'react'
import { ThumbsUp, AlertTriangle, ArrowRight } from 'lucide-react'
import StatusBadge from './StatusBadge'

const DuplicateModal = ({ show, duplicates = [], onSupportExisting, onProceedAnyway, onClose }) => {
  if (!show || duplicates.length === 0) return null

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg rounded-4">
          <div className="modal-header bg-amber-50 border-bottom border-amber-200">
            <div className="d-flex align-items-center gap-2">
              <div className="p-2 rounded-circle bg-warning text-white">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h5 className="modal-title fw-bold text-slate-800">Similar Existing Complaints Found Nearby</h5>
                <p className="small text-muted mb-0">
                  {duplicates.length} active issue(s) reported within 1km. You can upvote an existing report instead of creating a duplicate!
                </p>
              </div>
            </div>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>

          <div className="modal-body p-4" style={{ maxHeight: '420px', overflowY: 'auto' }}>
            <div className="d-flex flex-column gap-3">
              {duplicates.map((dup) => (
                <div key={dup.id} className="p-3 border rounded-3 civic-card d-flex justify-content-between align-items-center">
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="fw-bold small text-primary">{dup.complaint_number}</span>
                      <StatusBadge status={dup.status} />
                      <span className="badge bg-light text-secondary border small">
                        ~{dup.distance_meters}m away
                      </span>
                    </div>
                    <h6 className="fw-semibold mb-1 text-slate-900">{dup.title}</h6>
                    {dup.landmark && <p className="small text-muted mb-0">📍 {dup.landmark}</p>}
                    <small className="text-muted">
                      Reported {new Date(dup.created_at).toLocaleDateString()} &bull; {dup.support_count || 0} supporters
                    </small>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1.5 px-3"
                    onClick={() => onSupportExisting(dup.id)}
                  >
                    <ThumbsUp size={14} />
                    Support This
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="modal-footer bg-light border-top d-flex justify-content-between">
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={onClose}>
              Back to Form
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1"
              onClick={onProceedAnyway}
            >
              My Issue is Different — Submit New Report
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DuplicateModal
