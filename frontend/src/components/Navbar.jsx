import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationContext'
import api from '../services/api'
import { Globe, Bell, User, LogOut, ShieldAlert, FileText, Check, MapPin } from 'lucide-react'

const Navbar = () => {
  const { t, i18n } = useTranslation()
  const { user, logout, updateProfile } = useAuth()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const navigate = useNavigate()
  const [cities, setCities] = useState([])
  const [switchingCity, setSwitchingCity] = useState(false)

  useEffect(() => {
    if (user && user.role === 'citizen') {
      api.get('/cities').then(res => {
        setCities(res.data.cities || [])
      }).catch(err => console.error(err))
    }
  }, [user])

  const handleSwitchCity = async (cityId) => {
    try {
      setSwitchingCity(true)
      await updateProfile({ city_id: cityId })
    } catch (err) {
      console.error('Failed to switch municipality', err)
    } finally {
      setSwitchingCity(false)
    }
  }

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('pcms_language', lang)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const getDashboardPath = () => {
    if (!user) return '/login'
    switch (user.role) {
      case 'super_admin': return '/super-admin/dashboard'
      case 'city_admin': return '/city-admin/dashboard'
      case 'staff': return '/staff/dashboard'
      case 'citizen':
      default:
        return '/citizen/dashboard'
    }
  }

  return (
    <nav className="navbar navbar-expand-lg civic-navbar navbar-dark sticky-top px-3">
      <div className="container-fluid">
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2">
          <div className="bg-primary text-white p-1.5 rounded-2 d-flex align-items-center justify-content-center" style={{ width: 34, height: 34 }}>
            <ShieldAlert size={20} />
          </div>
          <div>
            <div className="fw-bold tracking-tight text-white mb-0" style={{ fontSize: '1.15rem', lineHeight: 1.2 }}>PCMS</div>
            <div className="text-slate-300 small d-none d-sm-block" style={{ fontSize: '0.72rem', letterSpacing: '0.02em' }}>
              {t('nav.portalName')}
            </div>
          </div>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#pcmsNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="pcmsNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-3">
            <li className="nav-item">
              <Link to="/public-feed" className="nav-link">{t('nav.publicFeed')}</Link>
            </li>
            <li className="nav-item">
              <Link to="/public-map" className="nav-link">{t('nav.publicMap')}</Link>
            </li>
            <li className="nav-item">
              <Link to="/anonymous/track" className="nav-link">{t('nav.trackAnonymous')}</Link>
            </li>
            <li className="nav-item">
              <Link to="/anonymous/submit" className="nav-link">{t('nav.submitAnonymous')}</Link>
            </li>
            <li className="nav-item">
              <Link to="/about" className="nav-link">{t('nav.about')}</Link>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-3">
            {/* Language Switcher */}
            <div className="dropdown">
              <button
                className="btn btn-sm btn-outline-light dropdown-toggle d-flex align-items-center gap-1.5"
                type="button"
                data-bs-toggle="dropdown"
              >
                <Globe size={15} />
                <span>{i18n.language === 'hi' ? 'हिन्दी' : 'English'}</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                <li>
                  <button
                    className={`dropdown-item d-flex justify-content-between align-items-center ${i18n.language === 'en' ? 'fw-bold text-primary' : ''}`}
                    onClick={() => handleLanguageChange('en')}
                  >
                    English {i18n.language === 'en' && <Check size={14} />}
                  </button>
                </li>
                <li>
                  <button
                    className={`dropdown-item d-flex justify-content-between align-items-center ${i18n.language === 'hi' ? 'fw-bold text-primary' : ''}`}
                    onClick={() => handleLanguageChange('hi')}
                  >
                    हिन्दी (Hindi) {i18n.language === 'hi' && <Check size={14} />}
                  </button>
                </li>
              </ul>
            </div>

            {/* Municipality Quick Switcher for Citizens */}
            {user && user.role === 'citizen' && (
              <div className="dropdown">
                <button
                  className="btn btn-sm btn-outline-light dropdown-toggle d-flex align-items-center gap-1.5"
                  type="button"
                  data-bs-toggle="dropdown"
                  disabled={switchingCity}
                  title="Switch Active Municipality / नगर पालिका बदलें"
                >
                  <MapPin size={14} className="text-warning" />
                  <span className="small fw-medium d-none d-sm-inline">
                    {user.city_name || 'Select Municipality'}
                  </span>
                  <span className="small fw-medium d-inline d-sm-none">
                    {user.city_name ? user.city_name.split(' ')[0] : 'City'}
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow-sm" style={{ minWidth: '240px' }}>
                  <li className="dropdown-header small text-muted">
                    📍 Switch Municipality / नगर पालिका बदलें
                  </li>
                  {cities.map((city) => (
                    <li key={city.id}>
                      <button
                        className={`dropdown-item small d-flex justify-content-between align-items-center py-2 ${user.city_id === city.id ? 'fw-bold text-primary active bg-light' : ''}`}
                        onClick={() => handleSwitchCity(city.id)}
                      >
                        <div>
                          <div>{city.name}</div>
                          <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{city.state}</div>
                        </div>
                        {user.city_id === city.id && <Check size={14} className="text-primary ms-2" />}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Authenticated User Items */}
            {user ? (
              <>
                {/* Notification Bell */}
                <div className="dropdown">
                  <button
                    className="btn btn-link text-white position-relative p-1"
                    type="button"
                    data-bs-toggle="dropdown"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>
                  <div className="dropdown-menu dropdown-menu-end notification-bell-dropdown p-0 shadow-lg border-0 rounded-3">
                    <div className="p-2.5 bg-light border-bottom d-flex justify-content-between align-items-center">
                      <span className="fw-semibold small">{t('common.notifications')}</span>
                      {unreadCount > 0 && (
                        <button
                          className="btn btn-link btn-xs p-0 text-primary small text-decoration-none"
                          onClick={markAllAsRead}
                        >
                          {t('common.markAllRead')}
                        </button>
                      )}
                    </div>
                    <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div className="p-3 text-center text-muted small">{t('common.noNotifications')}</div>
                      ) : (
                        notifications.slice(0, 10).map((n) => (
                          <div
                            key={n.id}
                            className={`p-2.5 border-bottom small ${n.is_read ? 'bg-white' : 'bg-blue-50'}`}
                            onClick={() => !n.is_read && markAsRead(n.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            <div className="fw-semibold text-slate-900">{n.title}</div>
                            <div className="text-secondary small">{n.message}</div>
                            <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* User Menu */}
                <div className="dropdown">
                  <button
                    className="btn btn-sm btn-outline-light dropdown-toggle d-flex align-items-center gap-2"
                    type="button"
                    data-bs-toggle="dropdown"
                  >
                    <User size={16} />
                    <span className="d-none d-md-inline">{user.full_name}</span>
                    <span className="badge bg-primary text-white" style={{ fontSize: '0.65rem' }}>
                      {t(`roles.${user.role}`, user.role)}
                    </span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                    <li>
                      <Link to={getDashboardPath()} className="dropdown-item">
                        {t('nav.dashboard')}
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger d-flex align-items-center gap-2" onClick={handleLogout}>
                        <LogOut size={14} />
                        {t('nav.logout')}
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-sm btn-outline-light">
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="btn btn-sm btn-primary">
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
