import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import { Building2, Plus, CheckCircle, XCircle, MapPin } from 'lucide-react'

const CityManagePage = () => {
  const { t } = useTranslation()
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)

  // Create City Modal state
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    state: '',
    country: 'India',
    latitude: 28.6139,
    longitude: 77.2090,
    boundary_radius_km: 25.0,
    contact_email: '',
    helpline_number: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const fetchCities = async () => {
    try {
      const res = await api.get('/cities/all')
      setCities(res.data.cities)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCities()
  }, [])

  const handleToggleStatus = async (cityId) => {
    try {
      await api.patch(`/cities/${cityId}/toggle-status`)
      fetchCities()
    } catch (err) {
      alert('Failed to update city status')
    }
  }

  const handleCreateCity = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const payload = {
        name: formData.name.trim(),
        slug: formData.slug.trim().toLowerCase(),
        state: formData.state.trim().replace(/[\\/]/g, ''),
        country: formData.country || 'India',
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        boundary_radius_km: parseFloat(formData.boundary_radius_km) || 25.0,
        contact_email: formData.contact_email?.trim() || null,
        helpline_number: formData.helpline_number?.trim() || null,
      }
      await api.post('/cities', payload)
      setShowModal(false)
      fetchCities()
    } catch (err) {
      const errData = err.response?.data
      if (errData?.errors) {
        const msg = Object.entries(errData.errors).map(([k, v]) => `${k}: ${v}`).join(', ')
        setError(msg)
      } else {
        setError(errData?.error || 'Failed to create city')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h4 className="fw-bold text-slate-900 mb-1">City & Municipality Governance</h4>
          <p className="text-muted small mb-0">Onboard and manage municipal corporations across India</p>
        </div>
        <button
          className="btn btn-civic btn-sm d-inline-flex align-items-center gap-1.5"
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} />
          <span>Onboard New City</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="civic-table table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>City Name</th>
                <th>Slug</th>
                <th>State</th>
                <th>Center Coordinates</th>
                <th>Departments</th>
                <th>Staff</th>
                <th>Citizens</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cities.map((c) => (
                <tr key={c.id}>
                  <td className="fw-bold text-slate-900 small">{c.name}</td>
                  <td className="small font-monospace text-muted">{c.slug}</td>
                  <td className="small text-muted">{c.state}</td>
                  <td className="small text-muted">{c.latitude?.toFixed(4)}, {c.longitude?.toFixed(4)}</td>
                  <td className="small text-center">{c.departments_count}</td>
                  <td className="small text-center">{c.staff_count}</td>
                  <td className="small text-center">{c.citizens_count}</td>
                  <td>
                    <span className={`badge ${c.is_active ? 'bg-success' : 'bg-secondary'} text-white small`}>
                      {c.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn btn-xs ${c.is_active ? 'btn-outline-danger' : 'btn-outline-success'} py-1 px-2 small`}
                      onClick={() => handleToggleStatus(c.id)}
                    >
                      {c.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE CITY MODAL */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Onboard New Municipal Corporation</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleCreateCity}>
                <div className="modal-body">
                  {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">City / Corporation Name *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        placeholder="e.g. Pune Municipal Corporation"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Unique Slug (Identifier) *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        placeholder="e.g. pune"
                        value={formData.slug}
                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">State *</label>
                      <input
                        type="text"
                        className="form-control"
                        required
                        placeholder="e.g. Maharashtra"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Helpline Contact Number</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="020-25501000"
                        value={formData.helpline_number}
                        onChange={(e) => setFormData({ ...formData, helpline_number: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Center Latitude *</label>
                      <input
                        type="number"
                        step="any"
                        className="form-control"
                        required
                        value={formData.latitude}
                        onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Center Longitude *</label>
                      <input
                        type="number"
                        step="any"
                        className="form-control"
                        required
                        value={formData.longitude}
                        onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Boundary Radius (km)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.boundary_radius_km}
                        onChange={(e) => setFormData({ ...formData, boundary_radius_km: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-sm btn-primary" disabled={saving}>
                    {saving ? 'Creating...' : 'Onboard City'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CityManagePage
