import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Users, UserPlus, Mail, Phone, Building } from 'lucide-react'

const StaffManagePage = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [staffList, setStaffList] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)

  // Registration Modal
  const [showModal, setShowModal] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    try {
      const [staffRes, deptRes] = await Promise.all([
        api.get('/admin/city/staff'),
        api.get(`/departments/city/${user.city_id}`)
      ])
      setStaffList(staffRes.data.staff)
      setDepartments(deptRes.data.departments)
      if (deptRes.data.departments.length > 0) {
        setDepartmentId(deptRes.data.departments[0].id)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreateStaff = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await api.post('/admin/city/staff', {
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        department_id: parseInt(departmentId),
        password: password,
      })
      setShowModal(false)
      setFullName('')
      setEmail('')
      setPhone('')
      setPassword('')
      fetchData()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register staff')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h4 className="fw-bold text-slate-900 mb-1">Department Staff Directory</h4>
          <p className="text-muted small mb-0">Authorized field staff and municipal officers for {user.city_name}</p>
        </div>
        <button
          className="btn btn-civic btn-sm d-inline-flex align-items-center gap-1.5"
          onClick={() => setShowModal(true)}
        >
          <UserPlus size={16} />
          <span>Register New Staff</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : staffList.length === 0 ? (
        <div className="civic-card p-5 text-center text-muted">
          No staff members registered in your city.
        </div>
      ) : (
        <div className="civic-table table-responsive">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((s) => (
                <tr key={s.id}>
                  <td className="fw-bold text-slate-900 small">{s.full_name}</td>
                  <td>
                    <span className="badge bg-light text-primary border small">
                      {s.department_name || 'Assigned'}
                    </span>
                  </td>
                  <td className="small text-muted">{s.email}</td>
                  <td className="small text-muted">{s.phone || 'N/A'}</td>
                  <td><span className="badge bg-success text-white small">Active</span></td>
                  <td className="small text-muted">{new Date(s.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE STAFF MODAL */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Register Department Staff Member</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleCreateStaff}>
                <div className="modal-body">
                  {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Full Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Department *</label>
                    <select
                      className="form-select"
                      required
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                    >
                      {departments.map((d) => (
                        <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                      ))}
                    </select>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-md-7">
                      <label className="form-label small fw-semibold">Work Email *</label>
                      <input
                        type="email"
                        className="form-control"
                        required
                        placeholder="staff@city.gov.in"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="col-md-5">
                      <label className="form-label small fw-semibold">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="98XXXXXXXX"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
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
                    {saving ? 'Registering...' : 'Register Staff'}
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

export default StaffManagePage
