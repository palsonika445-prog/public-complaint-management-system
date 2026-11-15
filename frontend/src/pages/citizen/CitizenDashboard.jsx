import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import StatCard from '../../components/StatCard'
import StatusBadge from '../../components/StatusBadge'
import PriorityBadge from '../../components/PriorityBadge'
import { PlusCircle, FileText, Clock, CheckCircle, AlertTriangle, ArrowRight, Bell, MapPin, Check } from 'lucide-react'

const CitizenDashboard = () => {
  const { t } = useTranslation()
  const { user, updateProfile } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cities, setCities] = useState([])
  const [switchingCity, setSwitchingCity] = useState(false)
  const [switchSuccessMsg, setSwitchSuccessMsg] = useState(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, citiesRes] = await Promise.all([
          api.get('/citizen/dashboard'),
          api.get('/cities')
        ])
        setData(dashRes.data)
        setCities(citiesRes.data.cities || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const handleCitySwitch = async (cityId, cityName) => {
    try {
      setSwitchingCity(true)
      await updateProfile({ city_id: cityId })
      setSwitchSuccessMsg(`Active municipality changed to ${cityName}`)
      setTimeout(() => setSwitchSuccessMsg(null), 4000)
    } catch (err) {
      console.error('Failed to change municipality', err)
    } finally {
      setSwitchingCity(false)
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

  const stats = data?.stats || {}

  return (
    <div>
      {/* Header Banner */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3 bg-white p-4 rounded-4 shadow-sm border">
        <div>
          <h4 className="fw-bold text-slate-900 mb-1">
            {t('dashboard.welcome')}, {user?.full_name}!
          </h4>
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="text-muted small">
              Default Municipality: <strong>{user?.city_name || 'Not Selected'}</strong>
            </span>
            <div className="dropdown">
              <button
                className="btn btn-xs btn-outline-primary py-0.5 px-2 dropdown-toggle small d-inline-flex align-items-center gap-1"
                type="button"
                data-bs-toggle="dropdown"
                disabled={switchingCity}
              >
                <MapPin size={12} />
                <span>बदलें / Switch</span>
              </button>
              <ul className="dropdown-menu shadow-sm">
                <li className="dropdown-header small text-muted">Select Municipality</li>
                {cities.map((city) => (
                  <li key={city.id}>
                    <button
                      className={`dropdown-item small d-flex justify-content-between align-items-center ${user?.city_id === city.id ? 'fw-bold text-primary active bg-light' : ''}`}
                      onClick={() => handleCitySwitch(city.id, city.name)}
                    >
                      <span>{city.name} ({city.state})</span>
                      {user?.city_id === city.id && <Check size={14} className="text-primary ms-2" />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <span className="text-muted small">&bull; Citizen Portal</span>
          </div>
          {switchSuccessMsg && (
            <div className="alert alert-success py-1 px-2.5 small mt-2 mb-0 d-inline-block">
              ✓ {switchSuccessMsg}
            </div>
          )}
        </div>
        <Link to="/citizen/submit" className="btn btn-civic shadow-sm d-inline-flex align-items-center gap-2">
          <PlusCircle size={18} />
          <span>{t('nav.fileComplaint')}</span>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title={t('dashboard.totalComplaints')}
            value={stats.total_complaints || 0}
            icon={FileText}
            color="blue"
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title={t('dashboard.pending')}
            value={stats.pending || 0}
            icon={Clock}
            color="amber"
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title={t('dashboard.inProgress')}
            value={stats.in_progress || 0}
            icon={AlertTriangle}
            color="purple"
          />
        </div>
        <div className="col-sm-6 col-lg-3">
          <StatCard
            title={t('dashboard.resolved')}
            value={stats.resolved || 0}
            icon={CheckCircle}
            color="green"
          />
        </div>
      </div>

      <div className="row g-4">
        {/* Recent Complaints */}
        <div className="col-lg-8">
          <div className="civic-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-slate-900 mb-0">{t('dashboard.recentActivity')}</h5>
              <Link to="/citizen/complaints" className="btn btn-sm btn-link text-primary text-decoration-none fw-semibold">
                {t('dashboard.viewAll')} &rarr;
              </Link>
            </div>

            {data?.recent_complaints?.length === 0 ? (
              <div className="text-center py-4 text-muted small">
                {t('dashboard.noComplaints')}
              </div>
            ) : (
              <div className="d-flex flex-column gap-2.5">
                {data?.recent_complaints?.map((c) => (
                  <div key={c.id} className="p-3 border rounded-3 bg-light d-flex justify-content-between align-items-center">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="fw-bold small text-primary">{c.complaint_number}</span>
                        <StatusBadge status={c.status} />
                        <PriorityBadge priority={c.priority} />
                      </div>
                      <h6 className="fw-semibold text-slate-900 mb-1">{c.title}</h6>
                      <small className="text-muted">
                        {c.category_name} {c.city_name && <span>&bull; 📍 {c.city_name}</span>} &bull; {new Date(c.created_at).toLocaleDateString()}
                      </small>
                    </div>
                    <Link to={`/complaints/${c.id}`} className="btn btn-sm btn-outline-primary">
                      Track
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Notifications Column */}
        <div className="col-lg-4">
          <div className="civic-card p-4 h-100">
            <h5 className="fw-bold text-slate-900 mb-3 d-flex align-items-center gap-2">
              <Bell size={18} className="text-primary" />
              Recent Notifications
            </h5>
            {data?.recent_notifications?.length === 0 ? (
              <div className="text-center py-4 text-muted small">No notifications yet.</div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {data?.recent_notifications?.map((n) => (
                  <div key={n.id} className="p-2.5 border rounded-2 bg-white small">
                    <div className="fw-semibold text-slate-900">{n.title}</div>
                    <div className="text-secondary small">{n.message}</div>
                    <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CitizenDashboard
