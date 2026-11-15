import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/StatusBadge'
import PriorityBadge from '../../components/PriorityBadge'
import { CheckCircle2, UserCheck, Building, AlertCircle } from 'lucide-react'

const AssignComplaintsPage = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [complaints, setComplaints] = useState([])
  const [departments, setDepartments] = useState([])
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [departmentStaff, setDepartmentStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [successMsg, setSuccessMsg] = useState(null)

  // Assignment form state
  const [deptId, setDeptId] = useState('')
  const [staffId, setStaffId] = useState('')
  const [priority, setPriority] = useState('medium')
  const [notes, setNotes] = useState('')

  const fetchAssignmentData = async () => {
    setLoading(true)
    try {
      const cityId = user.city_id
      const [compRes, deptRes] = await Promise.all([
        api.get(`/complaints/public?city_id=${cityId}&status=submitted`),
        api.get(`/departments/city/${cityId}`)
      ])
      setComplaints(compRes.data.complaints)
      setDepartments(deptRes.data.departments)

      // If URL param specified complaint_id
      const targetId = searchParams.get('complaint_id')
      if (targetId) {
        const fullRes = await api.get(`/complaints/${targetId}`)
        setSelectedComplaint(fullRes.data.complaint)
        setPriority(fullRes.data.complaint.priority)
      } else if (compRes.data.complaints.length > 0) {
        const fullRes = await api.get(`/complaints/${compRes.data.complaints[0].id}`)
        setSelectedComplaint(fullRes.data.complaint)
        setPriority(fullRes.data.complaint.priority)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssignmentData()
  }, [])

  // When selected department changes, fetch staff in that department
  useEffect(() => {
    const fetchStaff = async () => {
      if (!deptId) {
        setDepartmentStaff([])
        return
      }
      try {
        const res = await api.get(`/departments/${deptId}/staff`)
        setDepartmentStaff(res.data.staff)
      } catch (err) {
        setDepartmentStaff([])
      }
    }
    fetchStaff()
  }, [deptId])

  const handleSelectComplaint = async (cId) => {
    try {
      const res = await api.get(`/complaints/${cId}`)
      setSelectedComplaint(res.data.complaint)
      setPriority(res.data.complaint.priority)
      setDeptId(res.data.complaint.assigned_department_id || '')
      setNotes('')
      setSuccessMsg(null)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAssignSubmit = async (e) => {
    e.preventDefault()
    if (!selectedComplaint || !deptId) {
      alert('Please select a department')
      return
    }

    setAssigning(true)
    try {
      await api.post(`/complaints/${selectedComplaint.id}/assign`, {
        department_id: parseInt(deptId),
        staff_id: staffId ? parseInt(staffId) : null,
        priority,
        notes,
      })
      setSuccessMsg(`Complaint ${selectedComplaint.complaint_number} allocated successfully!`)
      fetchAssignmentData()
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to assign complaint.')
    } finally {
      setAssigning(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-4">
        <h4 className="fw-bold text-slate-900 mb-1">Complaint Assignment & Allocation</h4>
        <p className="text-muted small mb-0">Review incoming complaints and dispatch them to the appropriate department and field officers</p>
      </div>

      {successMsg && (
        <div className="alert alert-success py-2 px-3 small d-flex justify-content-between align-items-center mb-4">
          <span>{successMsg}</span>
          <button type="button" className="btn-close btn-sm" onClick={() => setSuccessMsg(null)} />
        </div>
      )}

      <div className="row g-4">
        {/* Unassigned List */}
        <div className="col-lg-5">
          <div className="civic-card p-3 h-100">
            <h6 className="fw-bold text-slate-900 mb-3 border-bottom pb-2">
              Unassigned Queue ({complaints.length})
            </h6>

            {complaints.length === 0 ? (
              <p className="text-muted small text-center py-4">No unassigned complaints in this city.</p>
            ) : (
              <div className="d-flex flex-column gap-2" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {complaints.map((c) => (
                  <div
                    key={c.id}
                    className={`p-3 rounded-3 border ${selectedComplaint?.id === c.id ? 'border-primary bg-sky-50' : 'bg-white'}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSelectComplaint(c.id)}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="fw-bold small text-primary">{c.complaint_number}</span>
                      <PriorityBadge priority={c.priority} />
                    </div>
                    <div className="fw-semibold text-slate-900 small mb-1">{c.title}</div>
                    <div className="small text-muted">{c.category_name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Assignment Form */}
        <div className="col-lg-7">
          {selectedComplaint ? (
            <div className="civic-card p-4">
              <div className="d-flex justify-content-between align-items-start mb-3 border-bottom pb-3">
                <div>
                  <span className="badge bg-primary text-white mb-1">{selectedComplaint.complaint_number}</span>
                  <h5 className="fw-bold text-slate-900 mb-0">{selectedComplaint.title}</h5>
                  <small className="text-muted">{selectedComplaint.category_name} &bull; {selectedComplaint.city_name}</small>
                </div>
                <StatusBadge status={selectedComplaint.status} />
              </div>

              <div className="bg-light p-3 rounded-3 border small mb-4">
                <p className="mb-2"><strong>Description:</strong> {selectedComplaint.description}</p>
                {selectedComplaint.landmark && <p className="mb-1 text-muted">📍 Landmark: {selectedComplaint.landmark}</p>}
                <p className="mb-0 text-muted">Address: {selectedComplaint.address || 'GPS Coordinates available'}</p>
              </div>

              <form onSubmit={handleAssignSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Target Department *</label>
                  <select
                    className="form-select"
                    required
                    value={deptId}
                    onChange={(e) => { setDeptId(e.target.value); setStaffId(''); }}
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Specific Staff Member (Optional)</label>
                  <select
                    className="form-select"
                    value={staffId}
                    onChange={(e) => setStaffId(e.target.value)}
                    disabled={!deptId || departmentStaff.length === 0}
                  >
                    <option value="">Auto-queue to Department Queue</option>
                    {departmentStaff.map((s) => (
                      <option key={s.id} value={s.id}>{s.full_name} ({s.email})</option>
                    ))}
                  </select>
                  {deptId && departmentStaff.length === 0 && (
                    <small className="text-muted">No staff currently registered in this department.</small>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">Adjust Priority & SLA Target</label>
                  <select
                    className="form-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="critical">Critical (12 hours SLA)</option>
                    <option value="high">High (24 hours SLA)</option>
                    <option value="medium">Medium (72 hours SLA)</option>
                    <option value="low">Low (120 hours SLA)</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold">Administrative Instructions / Notes</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Provide specific directions for field investigation..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-civic w-100 py-2.5 fw-semibold d-inline-flex align-items-center justify-content-center gap-2"
                  disabled={assigning}
                >
                  <CheckCircle2 size={16} />
                  <span>{assigning ? 'Dispatching...' : 'Dispatch and Assign Complaint'}</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="civic-card p-5 text-center text-muted">
              Select a complaint from the queue to assign.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AssignComplaintsPage
