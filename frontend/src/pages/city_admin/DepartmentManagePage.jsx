import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { Building2, Plus, Users, CheckCircle } from 'lucide-react'

const DepartmentManagePage = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)

  // Create Modal
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const fetchDepartments = async () => {
    try {
      const res = await api.get(`/departments/city/${user.city_id}`)
      setDepartments(res.data.departments)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
  }, [])

  const handleCreateDepartment = async (e) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await api.post('/departments', {
        city_id: user.city_id,
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim(),
      })
      setShowModal(false)
      setName('')
      setCode('')
      setDescription('')
      fetchDepartments()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create department')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h4 className="fw-bold text-slate-900 mb-1">Municipal Departments</h4>
          <p className="text-muted small mb-0">Manage civic departments and organizational units for {user.city_name}</p>
        </div>
        <button
          className="btn btn-civic btn-sm d-inline-flex align-items-center gap-1.5"
          onClick={() => setShowModal(true)}
        >
          <Plus size={16} />
          <span>Add Department</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          {departments.map((d) => (
            <div key={d.id} className="col-md-6 col-lg-4">
              <div className="civic-card p-4 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-slate-900 text-sky-400 fw-bold px-2 py-1">{d.code}</span>
                    <span className="badge bg-success text-white small">Active</span>
                  </div>
                  <h5 className="fw-bold text-slate-900 mb-1">{d.name}</h5>
                  <p className="small text-muted mb-3">{d.description || 'No description provided'}</p>
                </div>
                <div className="pt-3 border-top d-flex justify-content-between align-items-center text-muted small">
                  <span className="d-flex align-items-center gap-1.5">
                    <Users size={15} />
                    {d.staff_count || 0} Staff Members
                  </span>
                  <span className="text-success small fw-semibold">Operational</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 border-0 shadow-lg">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Create New Department</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <form onSubmit={handleCreateDepartment}>
                <div className="modal-body">
                  {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Department Name *</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Health & Sanitation"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Code / Abbreviation *</label>
                    <input
                      type="text"
                      className="form-control text-uppercase"
                      required
                      placeholder="e.g. HLT"
                      maxLength={10}
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Functional responsibilities of this department..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-sm btn-primary" disabled={saving}>
                    {saving ? 'Creating...' : 'Create Department'}
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

export default DepartmentManagePage
