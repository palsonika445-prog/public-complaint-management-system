import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import { ShieldCheck, UserPlus, Building, Mail } from 'lucide-react'

const CityAdminManagePage = () => {
  const { t } = useTranslation()
  const [admins, setAdmins] = useState([])
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)

  // Create Modal
  const [showModal, setShowModal] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cityId, setCityId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    try {
      const [usersRes, citiesRes] = await Promise.all([
        api.get('/admin/super/users?role=city_admin'),
        api.get('/cities')
      ])
      setAdmins(usersRes.data.users)
      setCities(citiesRes.data.cities)
      if (citiesRes.data.cities.length > 0) setCityId(citiesRes.data.cities[0].id)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreateAdmin = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await api.post('/admin/super/city-admins', {
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        city_id: parseInt(cityId),
      })
      setShowModal(false)
      setFullName('')
      setEmail('')
      setPassword('')
      fetchData()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create City Admin')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h4 className="fw-bold text-slate-900 mb-1">City Administrators</h4>
          <p className="text-muted small mb-0">Appointed municipal officers responsible for city-level complaint management</p>
        </div>
        <button
          className="btn btn-civic btn-sm d-inline-flex align-items-center gap-1.5"
          onClick={() => setShowModal(true)}
        >
          <UserPlus size={16} />
          <span>Appoint City Admin</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : admins.length === 0 ? (
        <div className="civic-card p-5 text-center text-muted">
          No city administrators appointed yet.
        </div>
      ) : (
        <div className="civic-table table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Administrator Name</th>
                <th>Assigned City</th>
                <th>Work Email</th>
                <th>Account Status</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td className="fw-bold text-slate-900 small">{admin.full_name}</td>
                  <td>
                    <span className="badge bg-primary text-white small">
                      {admin.city_name || 'City'}
                    </span>
                  </td>
                  <td className="small text-muted">{admin.email}</td>
                  <td><span className="badge bg-success text-white small">Active</span></td>
                  <td className="small text-muted">{new Date(admin.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE ADMIN MODAL */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Appoint City Administrator</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleCreateAdmin}>
                <div className="modal-body">
                  {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Officer Vinod Verma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">City Jurisdiction *</label>
                    <select
                      className="form-select"
                      required
                      value={cityId}
                      onChange={(e) => setCityId(e.target.value)}
                    >
                      {cities.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} ({c.state})</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Official Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      required
                      placeholder="admin@city.gov.in"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Initial Password *</label>
                    <input
                      type="password"
                      className="form-control"
                      required
                      minLength={6}
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-sm btn-primary" disabled={saving}>
                    {saving ? 'Appointing...' : 'Create Admin Account'}
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

export default CityAdminManagePage
