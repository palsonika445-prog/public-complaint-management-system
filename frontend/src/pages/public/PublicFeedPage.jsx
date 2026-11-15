import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import StatusBadge from '../../components/StatusBadge'
import PriorityBadge from '../../components/PriorityBadge'
import { Search, Filter, ThumbsUp, MapPin, Calendar, ArrowRight } from 'lucide-react'

const PublicFeedPage = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [complaints, setComplaints] = useState([])
  const [cities, setCities] = useState([])
  const [categories, setCategories] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [supportMessage, setSupportMessage] = useState(null)

  // Search filter states
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [selectedCity, setSelectedCity] = useState(searchParams.get('city_id') || '')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category_id') || '')
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || '')

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [citiesRes, catsRes] = await Promise.all([
          api.get('/cities'),
          api.get('/categories')
        ])
        setCities(citiesRes.data.cities)
        setCategories(catsRes.data.categories)
      } catch (err) {
        console.error(err)
      }
    }
    fetchMetadata()
  }, [])

  const fetchFeed = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', page)
      params.append('per_page', 9)
      if (search) params.append('search', search)
      if (selectedCity) params.append('city_id', selectedCity)
      if (selectedCategory) params.append('category_id', selectedCategory)
      if (selectedStatus) params.append('status', selectedStatus)

      const res = await api.get(`/complaints/public?${params.toString()}`)
      setComplaints(res.data.complaints)
      setTotal(res.data.total)
      setPages(res.data.pages)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFeed()
  }, [page, selectedCity, selectedCategory, selectedStatus])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    fetchFeed()
  }

  const handleSupport = async (complaintId) => {
    if (!user) {
      navigate('/login')
      return
    }
    try {
      const res = await api.post(`/complaints/${complaintId}/support`)
      setSupportMessage(`Support added! (${res.data.support_count} total supporters)`)
      setComplaints(prev => prev.map(c => c.id === complaintId ? { ...c, support_count: res.data.support_count } : c))
      setTimeout(() => setSupportMessage(null), 3000)
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setSupportMessage('You have already supported this complaint.')
        setTimeout(() => setSupportMessage(null), 3000)
      }
    }
  }

  return (
    <div className="container py-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <h3 className="fw-bold text-slate-900 mb-1">{t('nav.publicFeed')}</h3>
          <p className="text-muted small mb-0">Browse and support civic infrastructure issues reported in your city</p>
        </div>
        <Link to="/citizen/submit" className="btn btn-civic btn-sm d-inline-flex align-items-center gap-1.5">
          <span>{t('nav.fileComplaint')}</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {supportMessage && (
        <div className="alert alert-info py-2 px-3 small mb-3">
          {supportMessage}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="civic-card p-3 mb-4">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-md-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light"><Search size={14} /></span>
              <input
                type="text"
                className="form-control"
                placeholder={t('common.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select
              className="form-select form-select-sm"
              value={selectedCity}
              onChange={(e) => { setSelectedCity(e.target.value); setPage(1); }}
            >
              <option value="">{t('form.selectCity')}</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <select
              className="form-select form-select-sm"
              value={selectedCategory}
              onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
            >
              <option value="">{t('form.selectCategory')}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-primary btn-sm w-100">
              Apply Filter
            </button>
          </div>
        </form>
      </div>

      {/* Complaints Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-5 civic-card">
          <p className="text-muted mb-0">{t('dashboard.noComplaints')}</p>
        </div>
      ) : (
        <div className="row g-3 mb-4">
          {complaints.map((c) => (
            <div key={c.id} className="col-md-6 col-lg-4">
              <div className="civic-card p-3.5 h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold small text-primary">{c.complaint_number}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  <h6 className="fw-bold text-slate-900 mb-1">{c.title}</h6>
                  <p className="small text-muted mb-2" style={{
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>
                    {c.description}
                  </p>
                  <div className="d-flex align-items-center gap-1.5 flex-wrap mb-2">
                    <span className="badge bg-light text-secondary border small">{c.category_name}</span>
                    <span className="badge bg-light text-secondary border small">{c.city_name}</span>
                    <PriorityBadge priority={c.priority} />
                  </div>
                  {c.landmark && (
                    <div className="small text-muted mb-2 text-truncate">📍 {c.landmark}</div>
                  )}
                  <small className="text-muted d-flex align-items-center mb-2">
                    <Calendar size={13} className="me-1" />
                    {new Date(c.created_at).toLocaleDateString()}
                  </small>
                </div>

                <div className="pt-2 border-top d-flex justify-content-between align-items-center">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
                    onClick={() => handleSupport(c.id)}
                  >
                    <ThumbsUp size={13} />
                    <span>{c.support_count || 0} {t('common.support')}</span>
                  </button>
                  <Link to={`/complaints/${c.id}`} className="btn btn-sm btn-link text-primary p-0 fw-semibold text-decoration-none">
                    {t('common.viewDetails')} &rarr;
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-2">
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </button>
          <span className="small text-muted px-2">Page {page} of {pages} ({total} issues)</span>
          <button
            className="btn btn-sm btn-outline-secondary"
            disabled={page >= pages}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

export default PublicFeedPage
