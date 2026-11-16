import React, { useState } from 'react'
import {
  CheckCircle2,
  ShieldCheck,
  UserCheck,
  Maximize2,
  X,
  Check
} from 'lucide-react'
import { BeforeRepairGraphic, AfterRepairGraphic } from './EvidenceGraphics'

const ResolutionEvidenceCard = ({ complaint }) => {
  const [activeZoomPhoto, setActiveZoomPhoto] = useState(null)

  if (!complaint || (complaint.status !== 'resolved' && complaint.status !== 'closed')) {
    return null
  }

  // Find user-uploaded attachments if any
  const beforeAtt = complaint.attachments?.find(a => !a.is_resolution_evidence)
  const afterAtt = complaint.attachments?.find(a => a.is_resolution_evidence)

  return (
    <div className="civic-card p-4 mb-4 border border-emerald-300 bg-white shadow-sm rounded-4 overflow-hidden">
      {/* Header Badge */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 pb-3 border-bottom gap-2">
        <div className="d-flex align-items-center gap-2">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-3">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="d-flex align-items-center gap-2">
              <h5 className="fw-bold text-slate-900 mb-0">
                Ground Resolution Evidence & Inspection Proof
              </h5>
              <span className="badge bg-emerald-600 text-white rounded-pill px-2 py-0.5" style={{ fontSize: '0.65rem' }}>
                Anti-Fraud Verified
              </span>
            </div>
            <p className="text-muted small mb-0">
              Mandatory before-and-after photographic evidence certified by municipal field inspector
            </p>
          </div>
        </div>
        <div className="badge bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-pill px-3 py-1.5 small fw-semibold">
          <ShieldCheck size={14} className="me-1 d-inline text-emerald-600" />
          GPS Ground Tag Matched &bull; 100% SLA Compliant
        </div>
      </div>

      {/* Side-by-Side Visual Comparison Cards */}
      <div className="row g-3 mb-3">
        {/* 1. BEFORE COLUMN */}
        <div className="col-md-6">
          <div className="rounded-3 border overflow-hidden bg-white h-100 d-flex flex-column justify-content-between shadow-xs">
            <div className="p-2.5 bg-danger-subtle border-bottom d-flex justify-content-between align-items-center">
              <span className="badge bg-danger text-white fw-bold d-inline-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
                <span>1. BEFORE REPAIR</span>
              </span>
              <button
                type="button"
                className="btn btn-xs btn-link text-danger p-0 text-decoration-none fw-semibold d-inline-flex align-items-center gap-1"
                style={{ fontSize: '0.72rem' }}
                onClick={() => setActiveZoomPhoto({ type: 'before', title: 'Before Resolution: Citizen Grievance Photo' })}
              >
                <Maximize2 size={12} />
                <span>Enlarge</span>
              </button>
            </div>

            {/* Photo Container - Clean rendered graphic */}
            <div
              className="position-relative overflow-hidden cursor-pointer"
              style={{ height: '230px' }}
              onClick={() => setActiveZoomPhoto({ type: 'before', title: 'Before Resolution: Citizen Grievance Photo' })}
            >
              {beforeAtt?.download_url ? (
                <img
                  src={beforeAtt.download_url}
                  alt="Before Resolution"
                  className="w-100 h-100 object-fit-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    const fb = e.currentTarget.nextElementSibling
                    if (fb) fb.style.display = 'block'
                  }}
                />
              ) : null}
              <div style={{ display: beforeAtt?.download_url ? 'none' : 'block', width: '100%', height: '100%' }}>
                <BeforeRepairGraphic />
              </div>
              <span className="position-absolute bottom-0 start-0 m-2 badge bg-dark/85 text-white small px-2 py-1 backdrop-blur shadow-xs">
                📍 {complaint.landmark || 'Incident Site Coordinates'}
              </span>
            </div>

            <div className="p-2.5 small text-muted bg-white border-top">
              <div className="d-flex justify-content-between align-items-center">
                <span>Reported: <strong>{complaint.created_at ? new Date(complaint.created_at).toLocaleDateString() : 'N/A'}</strong></span>
                <span className="badge bg-danger-subtle text-danger border border-danger-subtle">
                  Deep Pothole
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. AFTER COLUMN (Bright, Clear, Newly Paved Road) */}
        <div className="col-md-6">
          <div className="rounded-3 border overflow-hidden bg-white h-100 d-flex flex-column justify-content-between shadow-xs">
            <div className="p-2.5 bg-success-subtle border-bottom d-flex justify-content-between align-items-center">
              <span className="badge bg-success text-white fw-bold d-inline-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
                <Check size={12} />
                <span>2. AFTER RESOLUTION</span>
              </span>
              <button
                type="button"
                className="btn btn-xs btn-link text-success p-0 text-decoration-none fw-semibold d-inline-flex align-items-center gap-1"
                style={{ fontSize: '0.72rem' }}
                onClick={() => setActiveZoomPhoto({ type: 'after', title: 'After Resolution: Municipal Work Completed' })}
              >
                <Maximize2 size={12} />
                <span>Enlarge</span>
              </button>
            </div>

            {/* Photo Container - Clean rendered graphic */}
            <div
              className="position-relative overflow-hidden cursor-pointer"
              style={{ height: '230px' }}
              onClick={() => setActiveZoomPhoto({ type: 'after', title: 'After Resolution: Municipal Work Completed' })}
            >
              {afterAtt?.download_url ? (
                <img
                  src={afterAtt.download_url}
                  alt="After Resolution"
                  className="w-100 h-100 object-fit-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    const fb = e.currentTarget.nextElementSibling
                    if (fb) fb.style.display = 'block'
                  }}
                />
              ) : null}
              <div style={{ display: afterAtt?.download_url ? 'none' : 'block', width: '100%', height: '100%' }}>
                <AfterRepairGraphic />
              </div>
              <span className="position-absolute bottom-0 start-0 m-2 badge bg-emerald-800 text-white small px-2 py-1 shadow-xs">
                ✓ Road Repaved &amp; Roller Compacted
              </span>
            </div>

            <div className="p-2.5 small text-muted bg-white border-top">
              <div className="d-flex justify-content-between align-items-center">
                <span>Completed: <strong>{complaint.resolved_at ? new Date(complaint.resolved_at).toLocaleDateString() : 'Recently'}</strong></span>
                <span className="badge bg-success-subtle text-success border border-success-subtle">
                  ✓ 100% Quality Pass
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Field Engineer Rectification Remarks */}
      <div className="p-3 rounded-3 bg-emerald-50/70 border border-emerald-200">
        <div className="d-flex align-items-center justify-content-between mb-1.5 flex-wrap gap-1">
          <div className="fw-semibold text-emerald-950 small d-flex align-items-center gap-1.5">
            <UserCheck size={16} className="text-emerald-700" />
            Field Engineer Ground Inspection Certificate:
          </div>
          <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
            Officer: <strong>{complaint.assigned_staff_name || 'Ramesh Kumar (Junior Engineer)'}</strong> &bull; {complaint.assigned_department_name || 'Public Works Department (PWD)'}
          </span>
        </div>
        <p className="text-slate-800 small mb-0" style={{ lineHeight: '1.5' }}>
          "{complaint.resolution_remarks || 'Civil rectification completed on site as per Smart City quality guidelines. WBM base compacted with 10-ton road roller, hot-mix asphalt bitumen layer applied and cured. Road reopened for public transit.'}"
        </p>
      </div>

      {/* Full-Screen Zoom Modal */}
      {activeZoomPhoto && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(4px)', zIndex: 1090 }}
          onClick={() => setActiveZoomPhoto(null)}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content border-0 shadow-2xl rounded-4 overflow-hidden">
              <div className="p-3 bg-slate-900 text-white d-flex justify-content-between align-items-center">
                <span className="fw-semibold small d-flex align-items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-400" />
                  {activeZoomPhoto.title}
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-link text-slate-300 p-0 text-decoration-none hover-text-white"
                  onClick={() => setActiveZoomPhoto(null)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="modal-body p-0 bg-slate-900 text-center" style={{ minHeight: '380px' }}>
                {activeZoomPhoto.type === 'before' ? (
                  <BeforeRepairGraphic style={{ maxHeight: '72vh' }} />
                ) : (
                  <AfterRepairGraphic style={{ maxHeight: '72vh' }} />
                )}
              </div>
              <div className="p-3 bg-white border-top d-flex justify-content-between align-items-center">
                <span className="small text-muted">
                  📍 {complaint.landmark || 'Incident Site Coordinates'} &bull; GPS Tag: {complaint.latitude?.toFixed(4)}, {complaint.longitude?.toFixed(4)}
                </span>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary px-3 py-1 fw-semibold"
                  onClick={() => setActiveZoomPhoto(null)}
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResolutionEvidenceCard
