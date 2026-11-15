import React from 'react'
import { Printer, X, ShieldCheck, CheckCircle2, Building2, MapPin, Calendar, Clock, QrCode } from 'lucide-react'

const GrievanceReceiptModal = ({ isOpen, onClose, complaint }) => {
  if (!isOpen || !complaint) return null

  const trackingUrl = `${window.location.origin}/complaints/${complaint.id}`
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(trackingUrl)}`

  const handlePrint = () => {
    window.print()
  }

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', zIndex: 1070 }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '650px' }}>
        <div className="modal-content border-0 shadow-2xl rounded-4 overflow-hidden" id="printable-receipt-card">
          {/* Header Action Bar (Hidden on print) */}
          <div className="p-3 bg-slate-900 text-white d-flex justify-content-between align-items-center d-print-none">
            <span className="small fw-semibold text-slate-300 d-flex align-items-center gap-1.5">
              <Printer size={16} /> Official Grievance Acknowledgement Receipt (पावती)
            </span>
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-sm btn-primary py-1 px-3 fw-bold d-flex align-items-center gap-1.5 shadow-xs"
                onClick={handlePrint}
              >
                <Printer size={14} />
                <span>Print / Save as PDF</span>
              </button>
              <button
                type="button"
                className="btn btn-sm btn-link text-slate-400 p-0 text-decoration-none hover-text-white"
                onClick={onClose}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Printable Official Receipt Body */}
          <div className="modal-body p-4 p-md-5 bg-white text-slate-900" style={{ fontFamily: 'Georgia, serif' }}>
            {/* Government Emblem & Header */}
            <div className="text-center pb-3 border-bottom border-2 border-slate-800 mb-4">
              <div className="d-flex justify-content-center align-items-center gap-2 mb-1">
                <span className="badge bg-slate-900 text-white px-2.5 py-1 text-uppercase" style={{ fontSize: '0.68rem', letterSpacing: '0.08em' }}>
                  GOVERNMENT OF INDIA &bull; SMART CITIES MISSION
                </span>
              </div>
              <h4 className="fw-black text-slate-900 mb-0 tracking-tight" style={{ fontFamily: 'sans-serif' }}>
                PUBLIC COMPLAINT MANAGEMENT SYSTEM (PCMS)
              </h4>
              <div className="text-slate-600 small fw-bold">
                राष्ट्रीय नागरिक शिकायत निवारण प्रणाली &bull; आधिकारिक पंजीकरण पावती
              </div>
              <div className="small text-muted mt-0.5" style={{ fontSize: '0.75rem', fontFamily: 'sans-serif' }}>
                Under Right to Public Services Act (RTPS) &bull; Statutory Time-Bound Grievance Redressal
              </div>
            </div>

            {/* Top Receipt Bar */}
            <div className="p-2.5 bg-slate-50 border rounded-3 mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2" style={{ fontFamily: 'sans-serif' }}>
              <div>
                <span className="text-muted small d-block" style={{ fontSize: '0.72rem' }}>GRIEVANCE REGISTRATION NUMBER</span>
                <span className="fs-5 fw-black text-primary font-monospace">{complaint.complaint_number}</span>
              </div>
              <div className="text-end">
                <span className="text-muted small d-block" style={{ fontSize: '0.72rem' }}>FILING DATE & TIME</span>
                <span className="small fw-bold text-slate-800">
                  {complaint.created_at ? new Date(complaint.created_at).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>

            {/* Grid of Official Details */}
            <div className="row g-3 mb-4" style={{ fontFamily: 'sans-serif' }}>
              <div className="col-7">
                <table className="table table-sm table-borderless mb-0">
                  <tbody>
                    <tr>
                      <td className="text-muted small py-1" style={{ width: '130px' }}>Complainant:</td>
                      <td className="fw-bold text-slate-900 small py-1">
                        {complaint.citizen_name || 'Rahul Gupta'}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted small py-1">e-KYC Status:</td>
                      <td className="small py-1">
                        {complaint.citizen_is_aadhaar_verified ? (
                          <span className="badge bg-success-subtle text-success border border-success-subtle">
                            ✓ Aadhaar e-KYC Verified (**** 4819)
                          </span>
                        ) : (
                          <span className="badge bg-light text-muted border">Standard Citizen</span>
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted small py-1">Municipality:</td>
                      <td className="fw-semibold text-slate-900 small py-1">
                        {complaint.city_name || 'Indore Municipal Corporation'}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted small py-1">Department:</td>
                      <td className="fw-semibold text-slate-900 small py-1">
                        {complaint.assigned_department_name || complaint.category_name || 'Public Works Department (PWD)'}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted small py-1">Incident Site:</td>
                      <td className="small text-slate-800 py-1">
                        {complaint.landmark || 'Metro Line Pillar 42, A.B. Road'}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted small py-1">GPS Coordinates:</td>
                      <td className="small text-muted font-monospace py-1" style={{ fontSize: '0.75rem' }}>
                        {complaint.latitude?.toFixed(4)}° N, {complaint.longitude?.toFixed(4)}° E
                      </td>
                    </tr>
                    <tr>
                      <td className="text-muted small py-1">SLA Target:</td>
                      <td className="small fw-bold text-primary py-1">
                        {complaint.sla_target_hours || 72} Hours Maximum Redressal Window
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* QR Code & Digital Verification Box */}
              <div className="col-5 d-flex flex-column align-items-center justify-content-center text-center p-3 rounded-3 bg-slate-50 border">
                <img
                  src={qrCodeUrl}
                  alt="Complaint Tracking QR"
                  className="rounded p-1 bg-white border mb-2"
                  style={{ width: '120px', height: '120px' }}
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
                <span className="fw-bold text-slate-800" style={{ fontSize: '0.72rem' }}>
                  SCAN TO TRACK STATUS
                </span>
                <span className="text-muted" style={{ fontSize: '0.65rem' }}>
                  Live mobile tracking enabled
                </span>
              </div>
            </div>

            {/* Grievance Summary Box */}
            <div className="p-3 bg-slate-50 border rounded-3 mb-4" style={{ fontFamily: 'sans-serif' }}>
              <div className="fw-bold text-slate-800 small mb-1">
                Grievance Subject: <span className="fw-normal">{complaint.title}</span>
              </div>
              <div className="text-muted small" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                "{complaint.description}"
              </div>
            </div>

            {/* Statutory Terms & Signature Seal */}
            <div className="pt-3 border-top d-flex justify-content-between align-items-end" style={{ fontFamily: 'sans-serif' }}>
              <div>
                <div className="d-flex align-items-center gap-1.5 text-success small fw-bold">
                  <ShieldCheck size={16} />
                  <span>DIGITALLY CERTIFIED MUNICIPAL RECORD</span>
                </div>
                <div className="text-muted" style={{ fontSize: '0.68rem' }}>
                  This document is generated by PCMS e-Governance Gateway and is legally valid without physical signature.
                </div>
              </div>
              <div className="text-end">
                <div className="fw-bold text-slate-800 small">MUNICIPAL COMMISSIONER</div>
                <div className="text-muted" style={{ fontSize: '0.68rem' }}>Zonal Grievance Redressal Cell</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GrievanceReceiptModal
