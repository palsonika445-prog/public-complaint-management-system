import React, { useState, useRef } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Lock,
  Zap,
  RefreshCw,
  X,
  FileCheck2,
  Building2,
  Check
} from 'lucide-react'

const DigiLockerKycModal = ({ isOpen, onClose, onSuccess }) => {
  const { user, updateUser } = useAuth()

  const [step, setStep] = useState(1) // 1: enter Aadhaar, 2: enter OTP, 3: success
  const [aadhaarNumber, setAadhaarNumber] = useState('5489-3210-4819')
  const [consent, setConsent] = useState(true)
  const [demoOtp, setDemoOtp] = useState('')
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [last4, setLast4] = useState('4819')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const digitRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ]

  if (!isOpen) return null

  // Format Aadhaar with hyphens
  const handleAadhaarChange = (val) => {
    const raw = val.replace(/[^0-9]/g, '').slice(0, 12)
    let formatted = ''
    for (let i = 0; i < raw.length; i++) {
      if (i > 0 && i % 4 === 0) formatted += '-'
      formatted += raw[i]
    }
    setAadhaarNumber(formatted)
  }

  // Step 1: Send OTP
  const handleSendOtp = async (overrideNumber) => {
    const num = overrideNumber || aadhaarNumber
    const cleanDigits = num.replace(/[^0-9]/g, '')
    if (cleanDigits.length !== 12) {
      setError('Please enter a valid 12-digit Aadhaar / Virtual ID number.')
      return
    }
    if (!consent) {
      setError('Please accept UIDAI voluntary e-KYC consent to proceed.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const res = await api.post('/auth/aadhaar-send-otp', { aadhaar_number: cleanDigits })
      setDemoOtp(res.data.demo_otp || '123456')
      setLast4(res.data.aadhaar_last4 || cleanDigits.slice(-4))
      setStep(2)
      setOtpDigits(['', '', '', '', '', ''])
      setTimeout(() => {
        digitRefs[0]?.current?.focus()
      }, 150)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to dispatch UIDAI OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // 1-Click Auto Fill
  const handleAutoFill = () => {
    if (!demoOtp || demoOtp.length !== 6) return
    setOtpDigits(demoOtp.split(''))
    digitRefs[5]?.current?.focus()
  }

  const handleDigitChange = (index, value) => {
    const clean = value.replace(/[^0-9]/g, '')
    if (!clean) {
      const updated = [...otpDigits]
      updated[index] = ''
      setOtpDigits(updated)
      return
    }
    if (clean.length > 1) {
      const chars = clean.slice(0, 6).split('')
      const updated = [...otpDigits]
      chars.forEach((c, i) => {
        if (i < 6) updated[i] = c
      })
      setOtpDigits(updated)
      digitRefs[Math.min(chars.length, 5)]?.current?.focus()
      return
    }
    const updated = [...otpDigits]
    updated[index] = clean
    setOtpDigits(updated)
    if (index < 5 && clean) {
      digitRefs[index + 1]?.current?.focus()
    }
  }

  const handleDigitKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      digitRefs[index - 1]?.current?.focus()
    }
  }

  // Step 2: Verify OTP
  const handleVerifyOtp = async () => {
    const entered = otpDigits.join('')
    if (entered.length !== 6) {
      setError('Please enter all 6 digits of the OTP.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const res = await api.post('/auth/aadhaar-verify-otp', { otp: entered })
      if (res.data.user) {
        updateUser(res.data.user)
      }
      setStep(3)
      if (onSuccess) onSuccess(res.data.user)
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired Aadhaar OTP.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 1060 }}
    >
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '520px' }}>
        <div className="modal-content border-0 shadow-2xl rounded-4 overflow-hidden">
          {/* Government / DigiLocker Header */}
          <div className="p-4 text-white" style={{ background: 'linear-gradient(135deg, #090e1a 0%, #0f172a 60%, #0369a1 100%)' }}>
            <div className="d-flex justify-content-between align-items-start">
              <div className="d-flex align-items-center gap-2.5">
                <div className="p-2 bg-sky-500/20 text-sky-400 rounded-3 border border-sky-400/30">
                  <ShieldCheck size={26} />
                </div>
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-sky-950 text-sky-300 border border-sky-700 px-2 py-0.5 text-uppercase fw-semibold" style={{ fontSize: '0.65rem' }}>
                      DigiLocker • UIDAI e-KYC
                    </span>
                    <span className="badge bg-emerald-950 text-emerald-300 border border-emerald-700 px-2 py-0.5 text-uppercase fw-semibold" style={{ fontSize: '0.65rem' }}>
                      Govt of India
                    </span>
                  </div>
                  <h5 className="fw-bold text-white mb-0 mt-1">
                    Citizen Identity Verification
                  </h5>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-link text-slate-400 p-0 hover-text-white"
                onClick={onClose}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="modal-body p-4 bg-white">
            {error && (
              <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3 rounded-3">
                <AlertCircle size={16} className="text-danger flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* STEP 1: Enter 12-Digit Aadhaar */}
            {step === 1 && (
              <div>
                <p className="text-muted small mb-3">
                  Under the <strong>Aadhaar Act 2016</strong>, linking your identity ensures genuine grievance redressal and gives your complaints <strong>High-Priority SLA Status</strong> across municipal departments.
                </p>

                <div className="mb-3">
                  <label className="form-label small fw-semibold text-slate-700 d-flex align-items-center justify-content-between">
                    <span>12-Digit Aadhaar / Virtual ID (VID)</span>
                    <span className="text-muted" style={{ fontSize: '0.72rem' }}>Only last 4 digits stored</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-slate-600 fw-bold">
                      🇮🇳 UIDAI
                    </span>
                    <input
                      type="text"
                      className="form-control py-2.5 px-3 text-slate-900 font-monospace fs-6 fw-bold letter-spacing-1"
                      placeholder="XXXX - XXXX - XXXX"
                      value={aadhaarNumber}
                      onChange={(e) => handleAadhaarChange(e.target.value)}
                    />
                  </div>
                </div>

                {/* 1-Click Demo Aadhaar Button */}
                <div className="mb-3">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary w-100 py-1.5 d-flex align-items-center justify-content-center gap-1.5"
                    style={{ fontSize: '0.78rem' }}
                    onClick={() => {
                      setAadhaarNumber('5489-3210-4819')
                      handleSendOtp('5489-3210-4819')
                    }}
                  >
                    <Zap size={14} />
                    <span>⚡ 1-Click Presentation Demo Aadhaar (<strong>5489-3210-4819</strong>)</span>
                  </button>
                </div>

                {/* Statutory Consent */}
                <div className="form-check p-2.5 bg-slate-50 border rounded-3 mb-4">
                  <input
                    className="form-check-input ms-0 me-2"
                    type="checkbox"
                    id="aadhaarConsent"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  <label className="form-check-label small text-slate-600" htmlFor="aadhaarConsent" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                    I hereby voluntarily provide my consent to the Public Complaint Management System (PCMS) to verify my demographic details via DigiLocker / UIDAI e-KYC.
                  </label>
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-50 py-2 fw-semibold"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary w-50 py-2 fw-semibold d-flex align-items-center justify-content-center gap-1.5"
                    onClick={() => handleSendOtp()}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={16} className="spinner-border spinner-border-sm" />
                        <span>Sending OTP...</span>
                      </>
                    ) : (
                      <>
                        <span>Request UIDAI OTP</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Enter 6-Digit OTP with Simulated SMS Gateway */}
            {step === 2 && (
              <div>
                {/* Simulated SMS Notification Banner */}
                <div className="sms-toast-card p-3 mb-3">
                  <div className="d-flex align-items-start justify-content-between gap-2">
                    <div className="d-flex align-items-center gap-2">
                      <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-circle d-inline-flex">
                        <Smartphone size={16} />
                      </span>
                      <div>
                        <div className="fw-bold text-emerald-900 small">
                          UIDAI Aadhaar SMS Gateway
                        </div>
                        <div className="text-emerald-800" style={{ fontSize: '0.78rem' }}>
                          OTP for Aadhaar (ending <strong className="text-slate-900">{last4}</strong>) is <strong className="px-1.5 py-0.5 bg-white rounded border border-emerald-300 font-monospace fs-6 text-slate-900">{demoOtp}</strong>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-success px-2.5 py-1 fw-bold text-nowrap d-flex align-items-center gap-1 shadow-xs"
                      style={{ fontSize: '0.75rem' }}
                      onClick={handleAutoFill}
                    >
                      <Zap size={13} />
                      Auto Fill
                    </button>
                  </div>
                </div>

                <p className="text-center text-slate-700 small mb-2">
                  Enter 6-digit Aadhaar OTP code dispatched by UIDAI:
                </p>

                {/* 6 Digit Input Boxes */}
                <div className="d-flex justify-content-center gap-2 my-3">
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={digitRefs[index]}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="otp-box-input"
                      value={digit}
                      onChange={(e) => handleDigitChange(index, e.target.value)}
                      onKeyDown={(e) => handleDigitKeyDown(index, e)}
                    />
                  ))}
                </div>

                <div className="d-flex gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-50 py-2 fw-semibold"
                    onClick={() => setStep(1)}
                  >
                    ← Change Number
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary w-50 py-2 fw-semibold d-flex align-items-center justify-content-center gap-1.5"
                    onClick={handleVerifyOtp}
                    disabled={loading || otpDigits.join('').length !== 6}
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={16} className="spinner-border spinner-border-sm" />
                        <span>Verifying UIDAI...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} />
                        <span>Verify & Link e-KYC</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Verification Success Seal */}
            {step === 3 && (
              <div className="text-center py-3">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-circle d-inline-flex mb-3 border border-emerald-200 shadow-xs">
                  <CheckCircle2 size={44} />
                </div>
                <h4 className="fw-bold text-slate-900 mb-1">
                  DigiLocker Identity Verified!
                </h4>
                <p className="text-muted small mb-3">
                  Your PCMS citizen account is now verified under Government of India DigiLocker Framework.
                </p>

                {/* Official Seal Card */}
                <div className="p-3 rounded-3 bg-slate-50 border text-start mb-4">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="badge bg-success px-2 py-1 small">
                      <Check size={12} className="me-1 inline" /> e-KYC Approved
                    </span>
                    <span className="font-monospace fw-bold text-slate-700 small">
                      Aadhaar: **** **** {last4}
                    </span>
                  </div>
                  <div className="small text-slate-600 mb-1">
                    <strong>Trust Score:</strong> <span className="text-success fw-bold">98% (Authentic Citizen)</span>
                  </div>
                  <div className="small text-slate-600 mb-1">
                    <strong>Priority Status:</strong> Fast-Track Level 1 SLA Escalation
                  </div>
                  <div className="small text-slate-500" style={{ fontSize: '0.72rem' }}>
                    Tamper-proof digital cryptographic verification record registered.
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-primary w-100 py-2 fw-semibold"
                  onClick={onClose}
                >
                  Continue to Citizen Portal
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DigiLockerKycModal
