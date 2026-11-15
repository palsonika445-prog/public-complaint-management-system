import React, { useState, useMemo } from 'react'
import api from '../services/api'
import { Building2, X, PlusCircle, MapPin, Check, Search } from 'lucide-react'
import { ALL_INDIAN_STATES, getCitiesForState } from '../data/indiaLocations'

const AddCityModal = ({ show, onClose, onCityAdded }) => {
  const [stateName, setStateName] = useState('')
  const [cityName, setCityName] = useState('')
  const [coords, setCoords] = useState({ lat: 28.6139, lng: 77.2090 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

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

  if (!show) return null

  const handleSelectState = (state) => {
    setStateName(state)
    // Clear city if state changes
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
      const res = await api.post('/cities/citizen-add', {
        name: cityName.trim(),
        state: stateName.trim(),
        latitude: coords.lat,
        longitude: coords.lng
      })
      const createdCity = res.data.city
      setCityName('')
      setStateName('')
      if (onCityAdded) {
        onCityAdded(createdCity)
      }
      onClose()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add municipality')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', zIndex: 1060 }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          {/* Header */}
          <div className="modal-header bg-slate-900 text-white p-3.5 border-bottom border-slate-800">
            <h6 className="modal-title fw-bold d-flex align-items-center gap-2 mb-0">
              <Building2 size={19} className="text-sky-400" />
              <span>Add / Request Municipality (नया शहर जोड़ें)</span>
            </h6>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4">
              <p className="small text-muted mb-3">
                Select your <strong>State</strong> first, then choose or type your <strong>City</strong>. PCMS will auto-provision standard municipal departments (PWD, Sanitation, Water, Electrical, Drainage) for immediate complaint filing.
              </p>

              {error && (
                <div className="alert alert-danger py-2 px-3 small mb-3">
                  {error}
                </div>
              )}

              {/* 1. STATE / UNION TERRITORY FIRST */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-slate-800 d-flex justify-content-between">
                  <span>1. State / Union Territory (राज्य / केंद्र शासित प्रदेश) *</span>
                  {stateName && ALL_INDIAN_STATES.includes(stateName) && (
                    <span className="text-success small fw-semibold d-inline-flex align-items-center gap-1">
                      <Check size={14} /> Selected
                    </span>
                  )}
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <Search size={14} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    list="states-datalist"
                    className="form-control border-start-0"
                    required
                    placeholder="Type to search (e.g. Haryana, Maharashtra, UP, Bihar...)"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    autoComplete="off"
                  />
                </div>
                <datalist id="states-datalist">
                  {ALL_INDIAN_STATES.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>

                {/* State Quick Suggestions Pills (when typing) */}
                {stateName && !ALL_INDIAN_STATES.includes(stateName) && matchingStates.length > 0 && (
                  <div className="mt-1.5 p-2 bg-light border rounded-3" style={{ maxHeight: 110, overflowY: 'auto' }}>
                    <small className="text-muted d-block mb-1" style={{ fontSize: '0.72rem' }}>Suggestions:</small>
                    <div className="d-flex flex-wrap gap-1">
                      {matchingStates.slice(0, 8).map((s) => (
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

              {/* 2. CITY / MUNICIPALITY SECOND */}
              <div className="mb-3">
                <label className="form-label small fw-semibold text-slate-800 d-flex justify-content-between">
                  <span>2. City / Municipality Name (शहर / नगर पालिका का नाम) *</span>
                  {stateName ? (
                    <span className="text-muted small" style={{ fontSize: '0.72rem' }}>
                      {availableCities.length > 0 ? `${availableCities.length} cities available in ${stateName}` : 'Custom city name allowed'}
                    </span>
                  ) : null}
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <MapPin size={14} className="text-muted" />
                  </span>
                  <input
                    type="text"
                    list="cities-datalist"
                    className="form-control border-start-0"
                    required
                    placeholder={stateName ? `Type city in ${stateName} (e.g. Rohtak, Gurugram...)` : "Select State above first..."}
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
                <datalist id="cities-datalist">
                  {availableCities.map((c) => (
                    <option key={c.name} value={c.name} />
                  ))}
                </datalist>

                {/* City Suggestions Pills */}
                {stateName && matchingCities.length > 0 && cityName !== matchingCities[0]?.name && (
                  <div className="mt-1.5 p-2 bg-light border rounded-3" style={{ maxHeight: 120, overflowY: 'auto' }}>
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
              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer bg-light p-3 d-flex justify-content-between align-items-center">
              <small className="text-muted" style={{ fontSize: '0.73rem' }}>
                *All 28 States & 8 UTs with municipal cities supported
              </small>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-civic btn-sm d-inline-flex align-items-center gap-1.5 shadow-sm"
                  disabled={loading || !stateName.trim() || !cityName.trim()}
                >
                  <PlusCircle size={15} />
                  <span>{loading ? 'Adding...' : 'Onboard & Activate'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddCityModal
