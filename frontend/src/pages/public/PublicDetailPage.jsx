import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/StatusBadge'
import PriorityBadge from '../../components/PriorityBadge'
import Timeline from '../../components/Timeline'
import { ThumbsUp, Calendar, MapPin, Building, ArrowLeft, Image as ImageIcon } from 'lucide-react'

const PublicDetailPage = () => {
  const { id } = useParams()
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [supportCount, setSupportCount] = useState(0)

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/complaints/${id}`)
        setComplaint(res.data.complaint)
        setSupportCount(res.data.complaint.support_count || 0)
      } catch (err) {
        setError('Unable to load complaint details. It may be private or not exist.')
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [id])

  const handleSupport = async () => {
    if (!user) {
      navigate('/login')
      return
    }
    try {
      const res = await api.post(`/complaints/${id}/support`)
      setSupportCount(res.data.support_count)
    } catch (err) {
      alert(err.response?.data?.error || 'Support already registered')
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

  if (error || !complaint) {
    return (
      <div className="container py-5 text-center">
        <div className="civic-card p-4 max-w-md mx-auto" style={{ maxWidth: 500, margin: '0 auto' }}>
          <h5 className="text-danger fw-bold mb-2">Access Restricted</h5>
          <p className="text-muted small mb-3">{error}</p>
          <Link to="/public-feed" className="btn btn-outline-primary btn-sm">
            Back to Public Feed
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-4">
      <Link to="/public-feed" className="btn btn-link text-decoration-none text-muted p-0 mb-3 d-inline-flex align-items-center gap-1 small">
        <ArrowLeft size={14} />
        Back to Public Feed
      </Link>

      <div className="row g-4">
        {/* Main Details */}
        <div className="col-lg-8">
          <div className="civic-card p-4 mb-4">
            <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
              <div>
                <span className="badge bg-light text-primary border fw-bold px-2.5 py-1 mb-2 d-inline-block">
                  {complaint.complaint_number}
                </span>
                <h4 className="fw-bold text-slate-900 mb-1">{complaint.title}</h4>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span className="badge bg-sky-50 text-sky-700 border small">{complaint.category_name}</span>
                  <span className="badge bg-slate-100 text-slate-700 border small">{complaint.city_name}</span>
                  <PriorityBadge priority={complaint.priority} />
                </div>
              </div>
              <StatusBadge status={complaint.status} />
            </div>

            <div className="mb-4">
              <h6 className="fw-semibold text-slate-800 small text-uppercase">Description</h6>
              <p className="text-secondary bg-slate-50 p-3 rounded-3 border">
                {complaint.description}
              </p>
            </div>

            {complaint.landmark && (
              <div className="mb-3 d-flex align-items-center gap-2 text-muted small">
                <MapPin size={16} className="text-primary" />
                <span><strong>Location / Landmark:</strong> {complaint.landmark}</span>
              </div>
            )}

            <div className="d-flex align-items-center gap-2 text-muted small mb-3">
              <Calendar size={16} />
              <span><strong>Submitted on:</strong> {new Date(complaint.created_at).toLocaleString()}</span>
            </div>

            {/* Public Attachments */}
            {complaint.public_attachments && complaint.public_attachments.length > 0 && (
              <div className="mt-4 pt-3 border-top">
                <h6 className="fw-semibold text-slate-800 small text-uppercase mb-2">Public Photos & Attachments</h6>
                <div className="d-flex flex-wrap gap-2">
                  {complaint.public_attachments.map((att) => (
                    <a
                      key={att.id}
                      href={att.download_url}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5"
                    >
                      <ImageIcon size={14} />
                      <span>{att.original_name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Resolution Timeline & Support */}
        <div className="col-lg-4">
          <div className="civic-card p-3 mb-4 text-center">
            <h6 className="fw-bold text-slate-800 mb-2">Community Visibility</h6>
            <div className="display-6 fw-bold text-primary mb-1">{supportCount}</div>
            <p className="small text-muted mb-3">citizens have supported this civic report</p>
            <button
              type="button"
              className="btn btn-civic btn-sm w-100 d-inline-flex align-items-center justify-content-center gap-2 py-2"
              onClick={handleSupport}
            >
              <ThumbsUp size={16} />
              <span>Support This Issue</span>
            </button>
          </div>

          <div className="civic-card p-3.5">
            <h6 className="fw-bold text-slate-900 mb-3 border-bottom pb-2">Status History & Timeline</h6>
            <Timeline items={complaint.timeline || complaint.status_history || []} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default PublicDetailPage
