import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import {
  LogIn,
  KeyRound,
  AlertCircle,
  ShieldCheck,
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building2,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Send,
  RefreshCw,
  Zap,
  Check
} from 'lucide-react'

const LoginPage = () => {
  const { t } = useTranslation()
  const { login, loginWithOtp } = useAuth()
  const navigate = useNavigate()

  // Authentication mode: 'password' | 'otp'
  const [authMode, setAuthMode] = useState('password')

  // Password Login state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // OTP Login state
  const [otpIdentifier, setOtpIdentifier] = useState('')
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [otpSent, setOtpSent] = useState(false)
  const [demoOtp, setDemoOtp] = useState('')
  const [otpSending, setOtpSending] = useState(false)
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [otpSuccessMsg, setOtpSuccessMsg] = useState('')

  // 6 digit input refs
  const digitRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ]

  // Password reset state
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [resetMsg, setResetMsg] = useState(null)

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [resendTimer])

  const redirectByRole = (role) => {
    if (role === 'super_admin') navigate('/super-admin/dashboard')
    else if (role === 'city_admin') navigate('/city-admin/dashboard')
    else if (role === 'staff') navigate('/staff/dashboard')
    else navigate('/citizen/dashboard')
  }

  // 1. Password Login Handler
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const user = await login(email, password)
      redirectByRole(user.role)
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  // 2. Send OTP Handler
  const handleSendOtp = async (overrideIdentifier) => {
    const target = (overrideIdentifier || otpIdentifier).trim()
    if (!target) {
      setError('Please enter a valid 10-digit mobile number or email address.')
      return
    }
    setError(null)
    setOtpSending(true)
    try {
      const res = await api.post('/auth/send-otp', { identifier: target })
      setOtpSent(true)
      setDemoOtp(res.data.demo_otp || '123456')
      setResendTimer(30)
      setOtpSuccessMsg(res.data.message || 'OTP sent successfully')
      // Reset boxes
      setOtpDigits(['', '', '', '', '', ''])
      setTimeout(() => {
        digitRefs[0]?.current?.focus()
      }, 150)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Please check your number/email.')
    } finally {
      setOtpSending(false)
    }
  }

  // Auto-fill OTP from simulated SMS toast
  const handleAutoFillOtp = () => {
    if (!demoOtp || demoOtp.length !== 6) return
    const splitted = demoOtp.split('')
    setOtpDigits(splitted)
    digitRefs[5]?.current?.focus()
  }

  // Handle digit box changes
  const handleDigitChange = (index, value) => {
    // Only accept numeric characters
    const cleanVal = value.replace(/[^0-9]/g, '')
    if (!cleanVal) {
      const updated = [...otpDigits]
      updated[index] = ''
      setOtpDigits(updated)
      return
    }

    // If pasted multi-digit text
    if (cleanVal.length > 1) {
      const chars = cleanVal.slice(0, 6).split('')
      const updated = [...otpDigits]
      chars.forEach((c, i) => {
        if (i < 6) updated[i] = c
      })
      setOtpDigits(updated)
      const nextFocus = Math.min(chars.length, 5)
      digitRefs[nextFocus]?.current?.focus()
      return
    }

    // Single digit entry
    const updated = [...otpDigits]
    updated[index] = cleanVal
    setOtpDigits(updated)

    // Advance focus
    if (index < 5 && cleanVal) {
      digitRefs[index + 1]?.current?.focus()
    }
  }

  const handleDigitKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      digitRefs[index - 1]?.current?.focus()
    }
  }

  // 3. Verify OTP Handler
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault()
    const enteredCode = otpDigits.join('')
    if (enteredCode.length !== 6) {
      setError('Please enter all 6 digits of the OTP.')
      return
    }
    setError(null)
    setOtpVerifying(true)
    try {
      const user = await loginWithOtp(otpIdentifier, enteredCode)
      redirectByRole(user.role)
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid or expired OTP code.')
    } finally {
      setOtpVerifying(false)
    }
  }

  // Quick Demo fill helpers
  const fillDemoPassword = (demoEmail, demoPass) => {
    setEmail(demoEmail)
    setPassword(demoPass)
    setError(null)
  }

  const fillDemoOtp = (identifier) => {
    setOtpIdentifier(identifier)
    handleSendOtp(identifier)
  }

  // Password reset handlers
  const handleResetRequest = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/auth/password-reset-request', { email: resetEmail })
      setResetToken(res.data.demo_reset_token || '')
      setResetMsg(res.data.message)
    } catch (err) {
      setResetMsg('Error requesting reset.')
    }
  }

  const handleResetConfirm = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/auth/password-reset-confirm', {
        email: resetEmail,
        reset_token: resetToken,
        new_password: newPassword,
      })
      alert(res.data.message)
      setShowReset(false)
    } catch (err) {
      alert(err.response?.data?.error || 'Error resetting password')
    }
  }

  return (
    <div className="py-5" style={{ minHeight: '85vh', backgroundColor: '#f1f5f9' }}>
      <div className="container" style={{ maxWidth: '1120px' }}>
        <div className="card border-0 shadow-xl rounded-4 overflow-hidden">
          <div className="row g-0">
            {/* Left Column: Official Government / Civic Brand Showcase */}
            <div className="col-lg-5 p-4 p-md-5 login-hero-panel text-white d-flex flex-column justify-content-between">
              <div>
                {/* Government Header Tag */}
                <div className="d-flex align-items-center gap-2 mb-4">
                  <div className="p-2 rounded-3 bg-sky-500/20 text-sky-400 border border-sky-400/30">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <span className="badge bg-sky-900 text-sky-300 border border-sky-700 px-2.5 py-1 text-uppercase fw-semibold" style={{ fontSize: '0.68rem', letterSpacing: '0.05em' }}>
                      Govt. of India • Civic Tech Framework
                    </span>
                    <h6 className="mb-0 fw-bold text-slate-100" style={{ fontSize: '0.95rem' }}>
                      राष्ट्रीय जन शिकायत निवारण पोर्टल
                    </h6>
                  </div>
                </div>

                <h2 className="fw-black tracking-tight text-white mb-2" style={{ fontSize: '1.85rem' }}>
                  Public Complaint Management System
                </h2>
                <p className="text-slate-300 small mb-4" style={{ lineHeight: '1.6' }}>
                  Enterprise-grade municipal grievance portal connecting citizens directly with zonal municipal corporations for transparent, time-bound civic resolution.
                </p>

                {/* Platform Pillars */}
                <div className="d-flex flex-column gap-3 mb-4">
                  <div className="d-flex align-items-start gap-3 p-2.5 rounded-3 bg-white/5 border border-white/10">
                    <div className="p-1.5 rounded-2 bg-sky-500/20 text-sky-300 mt-0.5">
                      <Clock size={16} />
                    </div>
                    <div>
                      <div className="fw-semibold text-white small">Automated SLA Escalation Matrix</div>
                      <div className="text-slate-400" style={{ fontSize: '0.78rem' }}>
                        Overdue cases automatically escalate from L1 Field Staff to L2 Municipal Commissioner.
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3 p-2.5 rounded-3 bg-white/5 border border-white/10">
                    <div className="p-1.5 rounded-2 bg-emerald-500/20 text-emerald-300 mt-0.5">
                      <Zap size={16} />
                    </div>
                    <div>
                      <div className="fw-semibold text-white small">Instant OTP & Multi-Role RBAC</div>
                      <div className="text-slate-400" style={{ fontSize: '0.78rem' }}>
                        Single-click fast login for Citizens, Field Engineers, City Admins & Super Admins.
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-start gap-3 p-2.5 rounded-3 bg-white/5 border border-white/10">
                    <div className="p-1.5 rounded-2 bg-amber-500/20 text-amber-300 mt-0.5">
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <div className="fw-semibold text-white small">AI Duplicate Clustering & GPS Tagging</div>
                      <div className="text-slate-400" style={{ fontSize: '0.78rem' }}>
                        Detects redundant civic complaints within 200m radius using smart semantic analysis.
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Impact Counters Footer */}
              <div className="pt-4 border-top border-slate-700/60">
                <div className="row text-center g-2">
                  <div className="col-4">
                    <div className="fw-black text-sky-400 fs-5">4+</div>
                    <div className="text-slate-400 text-uppercase fw-semibold" style={{ fontSize: '0.65rem' }}>Municipalities</div>
                  </div>
                  <div className="col-4 border-start border-slate-700/60">
                    <div className="fw-black text-emerald-400 fs-5">80+</div>
                    <div className="text-slate-400 text-uppercase fw-semibold" style={{ fontSize: '0.65rem' }}>Grievances</div>
                  </div>
                  <div className="col-4 border-start border-slate-700/60">
                    <div className="fw-black text-amber-400 fs-5">94.8%</div>
                    <div className="text-slate-400 text-uppercase fw-semibold" style={{ fontSize: '0.65rem' }}>SLA Target</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Unified Authentication Hub */}
            <div className="col-lg-7 p-4 p-md-5 bg-white d-flex flex-column justify-content-between">
              <div>
                {/* Header & Mode Switcher */}
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 pb-3 mb-4 border-bottom">
                  <div>
                    <h3 className="fw-bold text-slate-900 mb-0">Secure Portal Access</h3>
                    <p className="text-muted small mb-0">Sign in to your municipal account or citizen dashboard</p>
                  </div>
                  
                  {/* Segmented Auth Mode Switcher */}
                  <div className="bg-slate-100 p-1 rounded-pill d-inline-flex border">
                    <button
                      type="button"
                      className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold transition-all ${
                        authMode === 'password'
                          ? 'bg-white shadow-sm text-primary'
                          : 'text-slate-600 border-0'
                      }`}
                      onClick={() => {
                        setAuthMode('password')
                        setError(null)
                      }}
                    >
                      <Lock size={14} className="me-1.5" />
                      Password
                    </button>
                    <button
                      type="button"
                      className={`btn btn-sm rounded-pill px-3 py-1 fw-semibold transition-all ${
                        authMode === 'otp'
                          ? 'bg-white shadow-sm text-primary'
                          : 'text-slate-600 border-0'
                      }`}
                      onClick={() => {
                        setAuthMode('otp')
                        setError(null)
                      }}
                    >
                      <Smartphone size={14} className="me-1.5" />
                      Instant OTP
                      <span className="badge bg-primary text-white ms-1.5 rounded-pill" style={{ fontSize: '0.62rem' }}>Fast</span>
                    </button>
                  </div>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="alert alert-danger py-2.5 px-3 small d-flex align-items-center gap-2 mb-3 rounded-3 shadow-xs">
                    <AlertCircle size={18} className="text-danger flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* ============================================================ */}
                {/* TAB 1: PASSWORD LOGIN */}
                {/* ============================================================ */}
                {authMode === 'password' && !showReset && (
                  <form onSubmit={handlePasswordSubmit}>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold text-slate-700 d-flex align-items-center gap-1.5">
                        <Mail size={15} className="text-slate-400" />
                        Registered Email Address
                      </label>
                      <input
                        type="email"
                        className="form-control py-2.5 px-3 text-slate-800"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                      />
                    </div>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <label className="form-label small fw-semibold text-slate-700 mb-0 d-flex align-items-center gap-1.5">
                          <Lock size={15} className="text-slate-400" />
                          Account Password
                        </label>
                        <button
                          type="button"
                          className="btn btn-link p-0 small text-decoration-none text-primary"
                          onClick={() => setShowReset(true)}
                        >
                          Forgot password?
                        </button>
                      </div>
                      <div className="input-group">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="form-control py-2.5 px-3 text-slate-800"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary px-3"
                          onClick={() => setShowPassword(!showPassword)}
                          title={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="btn btn-civic w-100 py-2.5 fw-semibold shadow-sm mb-3 d-flex align-items-center justify-content-center gap-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <RefreshCw size={16} className="spinner-border spinner-border-sm" />
                          <span>Authenticating credentials...</span>
                        </>
                      ) : (
                        <>
                          <LogIn size={17} />
                          <span>Sign In to Municipal Portal</span>
                        </>
                      )}
                    </button>

                    {/* Quick Demo Credentials for presentation */}
                    <div className="pt-3 border-top mt-3">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <span className="text-uppercase fw-bold text-slate-500" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                          ⚡ Quick Demo Credentials (1-Click Personas)
                        </span>
                        <span className="text-muted" style={{ fontSize: '0.7rem' }}>Click to auto-fill</span>
                      </div>
                      
                      <div className="row g-2">
                        <div className="col-6">
                          <button
                            type="button"
                            className="btn btn-outline-light border text-start p-2 w-100 h-100 rounded-3 hover-shadow-sm text-slate-700 bg-light"
                            onClick={() => fillDemoPassword('citizen.rahul@example.com', 'Citizen@123')}
                          >
                            <div className="d-flex align-items-center gap-1.5 mb-1">
                              <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-1.5 py-0.5" style={{ fontSize: '0.65rem' }}>
                                Citizen
                              </span>
                              <span className="fw-semibold small text-truncate">Indore Resident</span>
                            </div>
                            <div className="text-muted text-truncate" style={{ fontSize: '0.72rem' }}>
                              citizen.rahul@example.com
                            </div>
                          </button>
                        </div>

                        <div className="col-6">
                          <button
                            type="button"
                            className="btn btn-outline-light border text-start p-2 w-100 h-100 rounded-3 hover-shadow-sm text-slate-700 bg-light"
                            onClick={() => fillDemoPassword('pwd.staff@indore.gov.in', 'Staff@123')}
                          >
                            <div className="d-flex align-items-center gap-1.5 mb-1">
                              <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-1.5 py-0.5" style={{ fontSize: '0.65rem' }}>
                                Staff
                              </span>
                              <span className="fw-semibold small text-truncate">PWD Field Officer</span>
                            </div>
                            <div className="text-muted text-truncate" style={{ fontSize: '0.72rem' }}>
                              pwd.staff@indore.gov.in
                            </div>
                          </button>
                        </div>

                        <div className="col-6">
                          <button
                            type="button"
                            className="btn btn-outline-light border text-start p-2 w-100 h-100 rounded-3 hover-shadow-sm text-slate-700 bg-light"
                            onClick={() => fillDemoPassword('admin.indore@pcms.gov.in', 'Admin@123')}
                          >
                            <div className="d-flex align-items-center gap-1.5 mb-1">
                              <span className="badge bg-purple-subtle text-purple border px-1.5 py-0.5" style={{ fontSize: '0.65rem', backgroundColor: '#f3e8ff', color: '#7e22ce' }}>
                                City Admin
                              </span>
                              <span className="fw-semibold small text-truncate">Indore Municipal</span>
                            </div>
                            <div className="text-muted text-truncate" style={{ fontSize: '0.72rem' }}>
                              admin.indore@pcms.gov.in
                            </div>
                          </button>
                        </div>

                        <div className="col-6">
                          <button
                            type="button"
                            className="btn btn-outline-light border text-start p-2 w-100 h-100 rounded-3 hover-shadow-sm text-slate-700 bg-light"
                            onClick={() => fillDemoPassword('superadmin@pcms.gov.in', 'Admin@123')}
                          >
                            <div className="d-flex align-items-center gap-1.5 mb-1">
                              <span className="badge bg-success-subtle text-success border border-success-subtle px-1.5 py-0.5" style={{ fontSize: '0.65rem' }}>
                                Super Admin
                              </span>
                              <span className="fw-semibold small text-truncate">Govt. Supervisor</span>
                            </div>
                            <div className="text-muted text-truncate" style={{ fontSize: '0.72rem' }}>
                              superadmin@pcms.gov.in
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                )}

                {/* ============================================================ */}
                {/* TAB 2: INSTANT OTP LOGIN (MOBILE / EMAIL) */}
                {/* ============================================================ */}
                {authMode === 'otp' && (
                  <div>
                    {!otpSent ? (
                      /* STEP 1: Enter Mobile / Email */
                      <div>
                        <div className="mb-3">
                          <label className="form-label small fw-semibold text-slate-700 d-flex align-items-center gap-1.5">
                            <Smartphone size={16} className="text-primary" />
                            Enter 10-Digit Mobile Number or Email
                          </label>
                          <div className="input-group">
                            <span className="input-group-text bg-light text-slate-600 fw-semibold">
                              🇮🇳 +91
                            </span>
                            <input
                              type="text"
                              className="form-control py-2.5 px-3 text-slate-800"
                              placeholder="e.g. 9876543210 or your email"
                              value={otpIdentifier}
                              onChange={(e) => setOtpIdentifier(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSendOtp()
                              }}
                              autoFocus
                            />
                          </div>
                          <div className="form-text small text-muted">
                            New citizens will be instantly auto-registered upon OTP verification.
                          </div>
                        </div>

                        <button
                          type="button"
                          className="btn btn-civic w-100 py-2.5 fw-semibold shadow-sm mb-3 d-flex align-items-center justify-content-center gap-2"
                          onClick={() => handleSendOtp()}
                          disabled={otpSending}
                        >
                          {otpSending ? (
                            <>
                              <RefreshCw size={16} className="spinner-border spinner-border-sm" />
                              <span>Dispatching SMS Gateway OTP...</span>
                            </>
                          ) : (
                            <>
                              <Send size={16} />
                              <span>Send 6-Digit Verification Code</span>
                            </>
                          )}
                        </button>

                        {/* Fast Demo Presets for OTP */}
                        <div className="pt-3 border-top mt-3">
                          <div className="text-uppercase fw-bold text-slate-500 mb-2" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                            ⚡ Instant Presentation Demo Numbers
                          </div>
                          <div className="d-flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary py-1 px-2.5 rounded-pill"
                              style={{ fontSize: '0.75rem' }}
                              onClick={() => fillDemoOtp('9876543210')}
                            >
                              📱 Citizen: <strong>9876543210</strong>
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary py-1 px-2.5 rounded-pill"
                              style={{ fontSize: '0.75rem' }}
                              onClick={() => fillDemoOtp('citizen.rahul@example.com')}
                            >
                              ✉️ Email: <strong>citizen.rahul@example.com</strong>
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary py-1 px-2.5 rounded-pill"
                              style={{ fontSize: '0.75rem' }}
                              onClick={() => fillDemoOtp('9812345678')}
                            >
                              📱 New Citizen Mobile: <strong>9812345678</strong>
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* STEP 2: Enter 6-Digit Code with Simulated SMS Toast */
                      <div>
                        {/* Simulated Live SMS Gateway Notification */}
                        <div className="sms-toast-card p-3 mb-3">
                          <div className="d-flex align-items-start justify-content-between gap-2">
                            <div className="d-flex align-items-center gap-2">
                              <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-circle d-inline-flex">
                                <Smartphone size={16} />
                              </span>
                              <div>
                                <div className="fw-bold text-emerald-900 small">
                                  Govt SMS Gateway (Simulated Telephony)
                                </div>
                                <div className="text-emerald-800" style={{ fontSize: '0.8rem' }}>
                                  Your OTP is <strong className="fs-6 text-slate-900 px-1.5 py-0.5 bg-white rounded border border-emerald-300 font-monospace">{demoOtp}</strong>
                                </div>
                              </div>
                            </div>
                            <button
                              type="button"
                              className="btn btn-sm btn-success px-2.5 py-1 fw-bold text-nowrap d-flex align-items-center gap-1 shadow-xs"
                              style={{ fontSize: '0.75rem' }}
                              onClick={handleAutoFillOtp}
                            >
                              <Zap size={13} />
                              Auto Fill
                            </button>
                          </div>
                        </div>

                        <div className="text-center mb-3">
                          <p className="text-slate-700 small mb-2">
                            Enter the 6-digit verification code sent to <strong>{otpIdentifier}</strong>
                          </p>
                          
                          {/* 6-Digit Input Boxes */}
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
                        </div>

                        <button
                          type="button"
                          className="btn btn-civic w-100 py-2.5 fw-semibold shadow-sm mb-3 d-flex align-items-center justify-content-center gap-2"
                          onClick={() => handleVerifyOtp()}
                          disabled={otpVerifying || otpDigits.join('').length !== 6}
                        >
                          {otpVerifying ? (
                            <>
                              <RefreshCw size={16} className="spinner-border spinner-border-sm" />
                              <span>Validating token security...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={17} />
                              <span>Verify & Secure Sign-In</span>
                            </>
                          )}
                        </button>

                        <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                          <button
                            type="button"
                            className="btn btn-link btn-sm text-secondary p-0 text-decoration-none"
                            onClick={() => {
                              setOtpSent(false)
                              setError(null)
                            }}
                          >
                            ← Change number/email
                          </button>

                          {resendTimer > 0 ? (
                            <span className="small text-muted">
                              Resend code in <strong>{resendTimer}s</strong>
                            </span>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-link btn-sm text-primary p-0 text-decoration-none fw-semibold"
                              onClick={() => handleSendOtp()}
                              disabled={otpSending}
                            >
                              Resend OTP
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ============================================================ */}
                {/* PASSWORD RESET VIEW */}
                {/* ============================================================ */}
                {showReset && (
                  <div>
                    <div className="d-flex align-items-center gap-2 mb-3">
                      <KeyRound size={20} className="text-primary" />
                      <h5 className="fw-bold mb-0 text-slate-800">Reset Municipal Account Password</h5>
                    </div>

                    {resetMsg && (
                      <div className="alert alert-info py-2 px-3 small mb-3 rounded-3">
                        {resetMsg}
                      </div>
                    )}

                    <form onSubmit={handleResetRequest} className="mb-3">
                      <div className="mb-2">
                        <label className="form-label small fw-semibold text-slate-700">Registered Email</label>
                        <input
                          type="email"
                          className="form-control"
                          required
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          placeholder="e.g. citizen.rahul@example.com"
                        />
                      </div>
                      <button type="submit" className="btn btn-sm btn-outline-primary w-100 py-2 fw-semibold">
                        Generate Reset Token
                      </button>
                    </form>

                    {resetToken && (
                      <form onSubmit={handleResetConfirm} className="pt-3 border-top">
                        <div className="mb-2">
                          <label className="form-label small fw-semibold text-slate-700">Generated Demo Token</label>
                          <input
                            type="text"
                            className="form-control font-monospace"
                            required
                            value={resetToken}
                            onChange={(e) => setResetToken(e.target.value)}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label small fw-semibold text-slate-700">New Password</label>
                          <input
                            type="password"
                            className="form-control"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min 6 characters"
                          />
                        </div>
                        <button type="submit" className="btn btn-sm btn-primary w-100 py-2 fw-semibold">
                          Confirm Password Reset
                        </button>
                      </form>
                    )}

                    <button
                      type="button"
                      className="btn btn-link btn-sm text-secondary w-100 mt-2 text-decoration-none"
                      onClick={() => setShowReset(false)}
                    >
                      ← Back to standard login
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Registration CTA */}
              <div className="pt-3 border-top mt-4 text-center">
                <span className="small text-muted">
                  New citizen registering for the first time?{' '}
                  <Link to="/register" className="text-primary fw-bold text-decoration-none">
                    Register with State & City Autocomplete <ArrowRight size={14} className="d-inline" />
                  </Link>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
