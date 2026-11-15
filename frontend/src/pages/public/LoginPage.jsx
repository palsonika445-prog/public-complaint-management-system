import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { LogIn, KeyRound, AlertCircle, ShieldCheck } from 'lucide-react'

const LoginPage = () => {
  const { t } = useTranslation()
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Password reset state
  const [showReset, setShowReset] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [resetMsg, setResetMsg] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const user = await login(email, password)
      if (user.role === 'super_admin') navigate('/super-admin/dashboard')
      else if (user.role === 'city_admin') navigate('/city-admin/dashboard')
      else if (user.role === 'staff') navigate('/staff/dashboard')
      else navigate('/citizen/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail)
    setPassword(demoPass)
    setError(null)
  }

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
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-5">
          <div className="civic-card p-4 p-md-5 shadow-lg border-0 rounded-4">
            <div className="text-center mb-4">
              <div className="p-3 bg-sky-50 text-primary rounded-circle d-inline-flex mb-2">
                <LogIn size={28} />
              </div>
              <h3 className="fw-bold text-slate-900">{t('nav.login')}</h3>
              <p className="text-muted small">Sign in to your municipal or citizen account</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {!showReset ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                  />
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between">
                    <label className="form-label small fw-semibold text-slate-700">Password</label>
                    <button
                      type="button"
                      className="btn btn-link p-0 small text-decoration-none"
                      onClick={() => setShowReset(true)}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    type="password"
                    className="form-control"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-civic w-100 py-2.5 fw-semibold shadow-sm mb-3"
                  disabled={loading}
                >
                  {loading ? 'Authenticating...' : t('nav.login')}
                </button>

                <p className="small text-center text-muted mb-4">
                  New citizen? <Link to="/register" className="text-primary fw-semibold text-decoration-none">Create an account</Link>
                </p>

                {/* Quick Demo Credentials */}
                <div className="pt-3 border-top">
                  <small className="text-uppercase fw-bold text-muted d-block text-center mb-2" style={{ fontSize: '0.7rem' }}>
                    Quick Demo Credentials
                  </small>
                  <div className="d-grid gap-1.5">
                    <button
                      type="button"
                      className="btn btn-xs btn-outline-secondary text-start py-1 px-2 small"
                      onClick={() => fillDemo('citizen.rahul@example.com', 'Citizen@123')}
                    >
                      👤 <strong>Citizen:</strong> citizen.rahul@example.com (Indore)
                    </button>
                    <button
                      type="button"
                      className="btn btn-xs btn-outline-secondary text-start py-1 px-2 small"
                      onClick={() => fillDemo('pwd.staff@indore.gov.in', 'Staff@123')}
                    >
                      🛠️ <strong>Staff:</strong> pwd.staff@indore.gov.in (PWD)
                    </button>
                    <button
                      type="button"
                      className="btn btn-xs btn-outline-secondary text-start py-1 px-2 small"
                      onClick={() => fillDemo('admin.indore@pcms.gov.in', 'Admin@123')}
                    >
                      🏛️ <strong>City Admin:</strong> admin.indore@pcms.gov.in (Indore)
                    </button>
                    <button
                      type="button"
                      className="btn btn-xs btn-outline-secondary text-start py-1 px-2 small"
                      onClick={() => fillDemo('superadmin@pcms.gov.in', 'Admin@123')}
                    >
                      🛡️ <strong>Super Admin:</strong> superadmin@pcms.gov.in
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* Password Reset Flow */
              <div>
                <h6 className="fw-bold mb-2">Reset Password</h6>
                {resetMsg && <div className="alert alert-info py-2 small mb-2">{resetMsg}</div>}
                
                <form onSubmit={handleResetRequest} className="mb-3">
                  <div className="mb-2">
                    <label className="form-label small">Registered Email</label>
                    <input
                      type="email"
                      className="form-control form-control-sm"
                      required
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn btn-sm btn-outline-primary w-100">
                    Request Reset Token
                  </button>
                </form>

                {resetToken && (
                  <form onSubmit={handleResetConfirm} className="pt-2 border-top">
                    <div className="mb-2">
                      <label className="form-label small">Reset Token</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        required
                        value={resetToken}
                        onChange={(e) => setResetToken(e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small">New Password</label>
                      <input
                        type="password"
                        className="form-control form-control-sm"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 6 characters"
                      />
                    </div>
                    <button type="submit" className="btn btn-sm btn-primary w-100">
                      Confirm New Password
                    </button>
                  </form>
                )}

                <button
                  type="button"
                  className="btn btn-link btn-sm text-secondary w-100 mt-2"
                  onClick={() => setShowReset(false)}
                >
                  Back to Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
