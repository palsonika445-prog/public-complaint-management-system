import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { UserPlus, AlertCircle, Building, CheckCircle2 } from 'lucide-react'

const RegisterPage = () => {
  const { t } = useTranslation()
  const { register } = useAuth()
  const navigate = useNavigate()

  const [cities, setCities] = useState([])
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    city_id: '',
    preferred_language: 'en',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await api.get('/cities')
        setCities(res.data.cities)
        if (res.data.cities.length > 0) {
          setFormData(prev => ({ ...prev, city_id: res.data.cities[0].id }))
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchCities()
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await register({
        ...formData,
        city_id: parseInt(formData.city_id),
      })
      navigate('/citizen/dashboard')
    } catch (err) {
      const errData = err.response?.data
      if (errData?.errors) {
        const msg = Object.entries(errData.errors).map(([k, v]) => `${k}: ${v}`).join(', ')
        setError(msg)
      } else {
        setError(errData?.error || 'Registration failed. Please check inputs.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <div className="civic-card p-4 p-md-5 shadow-lg border-0 rounded-4">
            <div className="text-center mb-4">
              <div className="p-3 bg-sky-50 text-primary rounded-circle d-inline-flex mb-2">
                <UserPlus size={28} />
              </div>
              <h3 className="fw-bold text-slate-900">{t('nav.register')}</h3>
              <p className="text-muted small">Create your civic account to track complaints and support issues</p>
            </div>

            {error && (
              <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  className="form-control"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="e.g. Rahul Sharma"
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-md-7">
                  <label className="form-label small fw-semibold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                  />
                </div>
                <div className="col-md-5">
                  <label className="form-label small fw-semibold text-slate-700">Mobile Phone (Optional)</label>
                  <input
                    type="tel"
                    name="phone"
                    className="form-control"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="98XXXXXXXX"
                  />
                </div>
              </div>

              <div className="row g-2 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-slate-700">City / Municipality</label>
                  <select
                    name="city_id"
                    className="form-select"
                    required
                    value={formData.city_id}
                    onChange={handleChange}
                  >
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.state})</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold text-slate-700">Preferred Language</label>
                  <select
                    name="preferred_language"
                    className="form-select"
                    value={formData.preferred_language}
                    onChange={handleChange}
                  >
                    <option value="en">English</option>
                    <option value="hi">हिन्दी (Hindi)</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold text-slate-700">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                />
              </div>

              <button
                type="submit"
                className="btn btn-civic w-100 py-2.5 fw-semibold shadow-sm mb-3"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </button>

              <p className="small text-center text-muted mb-0">
                Already registered? <Link to="/login" className="text-primary fw-semibold text-decoration-none">Sign in</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
