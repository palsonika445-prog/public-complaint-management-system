import React, { useState, useEffect } from 'react'
import { MessageSquare, X, Check, ExternalLink, ShieldCheck, ArrowRight } from 'lucide-react'

const WhatsAppNotificationToast = ({ complaint, show, onClose }) => {
  const [visible, setVisible] = useState(show)

  useEffect(() => {
    setVisible(show)
  }, [show])

  if (!visible) return null

  const cityName = complaint?.city_name || 'Indore Municipal Corporation'
  const complaintNo = complaint?.complaint_number || 'PCMS-IND-2026-0001'
  const citizenName = complaint?.citizen_name || 'Rahul ji'
  const status = complaint?.status ? complaint.status.replace('_', ' ').toUpperCase() : 'IN PROGRESS'
  const deptName = complaint?.assigned_department_name || 'PWD Civil Works'

  return (
    <div
      className="position-fixed bottom-0 end-0 m-3 shadow-2xl rounded-4 overflow-hidden border border-emerald-400 bg-white"
      style={{
        width: '380px',
        zIndex: 1080,
        animation: 'slideUpBounce 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* WhatsApp Official Header Bar */}
      <div
        className="p-3 text-white d-flex justify-content-between align-items-center"
        style={{ backgroundColor: '#075E54' }}
      >
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center text-white"
            style={{ width: '32px', height: '32px', backgroundColor: '#25D366' }}
          >
            <MessageSquare size={18} />
          </div>
          <div>
            <div className="fw-bold small d-flex align-items-center gap-1">
              <span>{cityName}</span>
              <span className="badge bg-white text-emerald-800 rounded-circle p-0.5" style={{ fontSize: '0.6rem' }}>
                <Check size={10} className="text-success stroke-[3]" />
              </span>
            </div>
            <div className="text-white-50" style={{ fontSize: '0.68rem' }}>
              WhatsApp Verified Business &bull; Official Citizen Channel
            </div>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-link text-white-50 p-0 hover-text-white"
          onClick={() => {
            setVisible(false)
            if (onClose) onClose()
          }}
        >
          <X size={18} />
        </button>
      </div>

      {/* WhatsApp Message Bubble Body */}
      <div className="p-3" style={{ backgroundColor: '#ECE5DD' }}>
        <div
          className="p-3 bg-white rounded-3 shadow-xs position-relative"
          style={{ maxWidth: '92%', borderRadius: '0.6rem 0.6rem 0.6rem 0' }}
        >
          <div className="fw-bold text-emerald-800 small mb-1">
            🏛️ Citizen Grievance Real-Time Alert
          </div>
          <p className="text-slate-800 small mb-2" style={{ fontSize: '0.82rem', lineHeight: '1.45' }}>
            Namaste <strong>{citizenName}</strong>, your registered civic complaint <strong>#{complaintNo}</strong> has been updated to:
            <span className="d-block mt-1 badge bg-emerald-100 text-emerald-900 border border-emerald-300 py-1 px-2 fw-bold">
              Status: {status}
            </span>
          </p>
          <div className="small text-muted mb-2" style={{ fontSize: '0.75rem' }}>
            Assigned to <strong>{deptName}</strong> for time-bound resolution as per Smart City SLA guidelines.
          </div>
          
          <div className="d-flex justify-content-between align-items-center pt-2 border-top text-primary small">
            <span className="text-muted" style={{ fontSize: '0.68rem' }}>Live tracking link:</span>
            <span className="fw-bold" style={{ fontSize: '0.72rem' }}>
              pcms.gov.in/track <ExternalLink size={11} className="d-inline" />
            </span>
          </div>

          <span
            className="position-absolute bottom-0 end-0 pe-2 pb-1 text-muted"
            style={{ fontSize: '0.62rem' }}
          >
            Just now &bull; ✓✓
          </span>
        </div>
      </div>

      {/* Footer Quick Action */}
      <div className="p-2.5 bg-white border-top d-flex justify-content-between align-items-center">
        <span className="text-muted" style={{ fontSize: '0.7rem' }}>
          Simulated Telephony Integration
        </span>
        <button
          type="button"
          className="btn btn-sm btn-success px-3 py-1 fw-bold d-flex align-items-center gap-1 shadow-xs"
          style={{ fontSize: '0.75rem', backgroundColor: '#25D366', borderColor: '#25D366' }}
          onClick={() => {
            setVisible(false)
            if (onClose) onClose()
          }}
        >
          <span>Acknowledged</span>
        </button>
      </div>
    </div>
  )
}

export default WhatsAppNotificationToast
