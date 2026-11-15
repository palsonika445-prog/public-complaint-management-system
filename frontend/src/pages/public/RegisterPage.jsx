import React, { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'
import { ALL_INDIAN_STATES, getCitiesForState } from '../../data/indiaLocations'
import { UserPlus, AlertCircle, Building, CheckCircle2, Search, MapPin, Check } from 'lucide-react'

const RegisterPage = () => {
  const { t } = useTranslation()
  const { register } = useAuth()
  const navigate = useNavigate()

  const [cities, setCities] = useState([])
  const [stateName, setStateName] = useState('Haryana')
  const [cityName, setCityName] = useState('')
  const [coords, setCoords] = useState({ lat: 28.6139, lng: 77.2090 })

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    preferred_language: 'en',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await api.get('/cities')
        setCities(res.data.cities || [])
      } catch (err) {
        console.error(err)
      }
    }
    fetchCities()
  }, [])

  // State filtering
  const matchingStates = useMemo(() => {
    if (!stateName.trim()) return []
    const q = stateName.trim().toLowerCase()
    return ALL_INDIAN_STATES.filter(s => s.toLowerCase().includes(q))
  }, [stateName])

  // Available cities for selected state
  const availableCities = useMemo(() => {
    return getCitiesForState(stateName)
  }, [stateName])

  // City filtering based on input
  const matchingCities = useMemo(() => {
    if (!cityName.trim()) return availableCities.slice(0, 10)
    const q = cityName.trim().toLowerCase()
    return availableCities.filter(c => c.name.toLowerCase().includes(q))
  }, [cityName, availableCities])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSelectState = (state) => {
    setStateName(state)
    setCityName('')
  }

  const handleSelectCity = (cityObj) => {
    setCityName(cityObj.name)
    setCoords({ lat: cityObj.lat, lng: cityObj.lng })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!stateName.trim()) {
        setError('Please select or enter your State / Union Territory')
        setLoading(false)
        return
      }
      if (!cityName.trim()) {
        setError('Please select or enter your Home City / Municipality')
        setLoading(false)
        return
      }

      // Check if city exists in database already
      let finalCityId = null
      const matchedDbCity = cities.find(c =>
        c.name.toLowerCase().includes(cityName.trim().toLowerCase()) ||
        cityName.trim().toLowerCase().includes(c.name.toLowerCase()) ||
        c.slug === cityName.trim().toLowerCase().replace(/\s+/g, '-')
      )

      if (matchedDbCity) {
        finalCityId = matchedDbCity.id
      } else {
        // Auto-provision this new city in DB
        const addRes = await api.post('/cities/citizen-add', {
          name: cityName.trim(),
          state: stateName.trim(),
          latitude: coords.lat,
          longitude: coords.lng,
        })
        finalCityId = addRes.data.city.id
      }

      await register({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone || null,
        password: formData.password,
        preferred_language: formData.preferred_language,
        city_id: finalCityId,
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
        <div className="col-md-9 col-lg-7">
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
              {/* Full Name */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-slate-700">Full Name *</label>
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

              {/* Email & Mobile Phone */}
              <div className="row g-2 mb-3">
                <div className="col-md-7">
                  <label className="form-label small fw-semibold text-slate-700">Email Address *</label>
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

              {/* 1. STATE FIRST (State / Union Territory) */}
              <div className="row g-2 mb-3">
                <div className="col-md-7">
                  <label className="form-label small fw-semibold text-slate-700 d-flex justify-content-between align-items-center">
                    <span>1. State / Union Territory *</span>
                    {stateName && ALL_INDIAN_STATES.includes(stateName) && (
                      <span className="text-success small fw-semibold d-inline-flex align-items-center gap-1" style={{ fontSize: '0.72rem' }}>
                        <Check size={13} /> Selected
                      </span>
                    )}
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light border-end-0">
                      <Search size={14} className="text-muted" />
                    </span>
                    <input
                      type="text"
                      list="register-states"
                      className="form-control border-start-0"
                      required
                      placeholder="Type State (e.g. Haryana, Maharashtra...)"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                  <datalist id="register-states">
                    {ALL_INDIAN_STATES.map((s) => (
                      <option key={s} value={s} />
                    ))}
                  </datalist>

                  {/* State Suggestions Pills */}
                  {stateName && !ALL_INDIAN_STATES.includes(stateName) && matchingStates.length > 0 && (
                    <div className="mt-1.5 p-1.5 bg-light border rounded-3" style={{ maxHeight: 95, overflowY: 'auto' }}>
                      <div className="d-flex flex-wrap gap-1">
                        {matchingStates.slice(0, 6).map((s) => (
                          <button
                            key={s}
                            type="button"
                            className="btn btn-xs btn-outline-primary py-0.5 px-2 small rounded-pill"
                            onClick={() => handleSelectState(s)}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Preferred Language */}
                <div className="col-md-5">
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

              {/* 2. CITY SECOND (Home City / Municipality) */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-slate-700 d-flex justify-content-between align-items-center">
                  <span>2. Home City / Municipality *</span>
                  {stateName && (
                    <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                      {availableCities.length > 0 ? `${availableCities.length} cities in ${stateName}` : 'Custom municipality name supported'}
                    </span>
                  )}
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <MapPin size={14} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    list="register-cities"
                    className="form-control border-start-0"
                    required
                    placeholder={stateName ? `Type city in ${stateName} (e.g. Rohtak, Gurugram, Jhajjar...)` : "Select State above first..."}
                    value={cityName}
                    onChange={(e) => {
                      const val = e.target.value
                      setCityName(val)
                      const matched = availableCities.find(c => c.name.toLowerCase() === val.trim().toLowerCase())
                      if (matched) {
                        setCoords({ lat: matched.lat, lng: matched.lng })
                      }
                    }}
                    autoComplete="off"
                  />
                </div>
                <datalist id="register-cities">
                  {availableCities.map((c) => (
                    <option key={c.name} value={c.name} />
                  ))}
                </datalist>

                {/* City Suggestions Pills */}
                {stateName && matchingCities.length > 0 && cityName !== matchingCities[0]?.name && (
                  <div className="mt-1.5 p-2 bg-light border rounded-3" style={{ maxHeight: 110, overflowY: 'auto' }}>
                    <small className="text-muted d-block mb-1" style={{ fontSize: '0.72rem' }}>
                      Cities in {stateName} (Click to select):
                    </small>
                    <div className="d-flex flex-wrap gap-1">
                      {matchingCities.map((c) => (
                        <button
                          key={c.name}
                          type="button"
                          className={`btn btn-xs py-0.5 px-2 small rounded-pill ${cityName.toLowerCase() === c.name.toLowerCase() ? 'btn-primary' : 'btn-outline-secondary'}`}
                          onClick={() => handleSelectCity(c)}
                        >
                          📍 {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <small className="text-muted d-block mt-1" style={{ fontSize: '0.73rem' }}>
                  *You can switch municipality anytime or file complaints for any city.
                </small>
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="form-label small fw-semibold text-slate-700">Password *</label>
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

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-civic w-100 py-2.5 fw-semibold shadow-sm mb-3"
                disabled={loading || !stateName.trim() || !cityName.trim()}
              >
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </button>

              <div className="text-center small text-muted">
                Already registered?{' '}
                <Link to="/login" className="text-primary fw-semibold text-decoration-none">
                  Sign in
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
