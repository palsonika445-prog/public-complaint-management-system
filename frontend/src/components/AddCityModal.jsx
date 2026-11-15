import React, { useState } from 'react'
import api from '../services/api'
import { Building2, X, PlusCircle, CheckCircle } from 'lucide-react'

const AddCityModal = ({ show, onClose, onCityAdded }) => {
  const [cityName, setCityName] = useState('')
  const [stateName, setStateName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  if (!show) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await api.post('/cities/citizen-add', {
        name: cityName.trim(),
        state: stateName.trim()
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
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.7)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
          <div className="modal-header bg-slate-900 text-white p-3.5">
            <h6 className="modal-title fw-bold d-flex align-items-center gap-2 mb-0">
              <Building2 size={18} className="text-sky-400" />
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
                If your city or municipality is not in the list, enter it below. PCMS will instantly onboard it with standard departments (PWD, Sanitation, Water, Electrical, Drainage) so you can submit complaints right away.
              </p>

              {error && (
                <div className="alert alert-danger py-2 px-3 small mb-3">
                  {error}
                </div>
              )}

              <div className="mb-3">
                <label className="form-label small fw-semibold text-slate-700">
                  City / Municipality Name *
                </label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="e.g. Rohtak, Gurugram, Jaipur, Patna"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold text-slate-700">
                  State / Union Territory *
                </label>
                <input
                  type="text"
                  className="form-control"
                  required
                  placeholder="e.g. Haryana, Rajasthan, Bihar, Uttar Pradesh"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer bg-light p-3">
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
                className="btn btn-civic btn-sm d-inline-flex align-items-center gap-1.5"
                disabled={loading}
              >
                <PlusCircle size={15} />
                <span>{loading ? 'Adding...' : 'Onboard & Activate'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default AddCityModal
