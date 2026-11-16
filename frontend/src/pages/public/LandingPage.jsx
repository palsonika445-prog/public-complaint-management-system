import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import {
  ShieldCheck,
  MapPin,
  CheckCircle2,
  Users,
  Building,
  ArrowRight,
  Flame,
  Search,
  EyeOff,
  Smartphone
} from 'lucide-react'
import StatusBadge from '../../components/StatusBadge'

const LandingPage = () => {
  const { t } = useTranslation()
  const [cities, setCities] = useState([])
  const [recentComplaints, setRecentComplaints] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        const [citiesRes, feedRes] = await Promise.all([
          api.get('/cities'),
          api.get('/complaints/public?per_page=6')
        ])
        setCities(citiesRes.data.cities)
        setRecentComplaints(feedRes.data.complaints)
      } catch (err) {
        console.error('Failed to load landing data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchLandingData()
  }, [])

  return (
    <div>
      {/* Hero Section */}
      <section className="py-5 bg-slate-900 text-white border-bottom border-slate-800" style={{
        backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(2, 132, 199, 0.15) 0%, transparent 50%)'
      }}>
        <div className="container py-4">
          <div className="row align-items-center gy-4">
            <div className="col-lg-7">
              <span className="badge bg-sky-950 text-sky-400 border border-sky-800 px-3 py-1.5 rounded-pill mb-3">
                Civic Technology for Indian Municipalities
              </span>
              <h1 className="display-5 fw-bold tracking-tight mb-3">
                Empowering Citizens.<br />
                <span className="text-sky-400">Transforming Cities.</span>
              </h1>
              <p className="lead text-slate-300 mb-4" style={{ fontSize: '1.15rem' }}>
                A unified, accountable platform to report potholes, water supply issues, garbage collection, and streetlights directly to your municipal authority.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/app" className="btn btn-warning btn-lg px-4 py-2.5 shadow-sm d-inline-flex align-items-center gap-2 fw-bold text-slate-950">
                  <Smartphone size={18} />
                  <span>📱 Citizen Mobile App (PWA)</span>
                </Link>
                <Link to="/citizen/submit" className="btn btn-civic btn-lg px-4 py-2.5 shadow-sm d-inline-flex align-items-center gap-2">
                  <span>File a Complaint</span>
                  <ArrowRight size={18} />
                </Link>
                <Link to="/anonymous/submit" className="btn btn-outline-light btn-lg px-4 py-2.5 d-inline-flex align-items-center gap-2">
                  <EyeOff size={18} />
                  <span>Report Anonymously</span>
                </Link>
                <Link to="/public-map" className="btn btn-link text-sky-300 text-decoration-none d-inline-flex align-items-center gap-1.5">
                  <MapPin size={18} />
                  <span>Explore Live Civic Map</span>
                </Link>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="card bg-slate-800 border-slate-700 text-white p-4 rounded-4 shadow-lg">
                <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                  <Building size={20} className="text-sky-400" />
                  Active Municipalities
                </h5>
                <p className="small text-slate-400 mb-3">
                  Select your city to view local municipal officers, department SLAs, and public civic resolutions:
                </p>
                <div className="d-flex flex-column gap-2">
                  {cities.map((city) => (
                    <div key={city.id} className="p-2.5 bg-slate-900 border border-slate-700 rounded-3 d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-semibold text-white">{city.name}</div>
                        <small className="text-slate-400">{city.state}</small>
                      </div>
                      <Link to={`/public-feed?city_id=${city.id}`} className="btn btn-sm btn-outline-info">
                        View Issues
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Features Section */}
      <section className="py-5 bg-white border-bottom">
        <div className="container">
          <div className="row text-center gy-4">
            <div className="col-md-3">
              <div className="p-3">
                <div className="p-3 bg-sky-50 text-primary rounded-circle d-inline-flex mb-3">
                  <MapPin size={28} />
                </div>
                <h5 className="fw-bold text-slate-900">Pinpoint GPS Accuracy</h5>
                <p className="text-muted small">
                  Place map pins directly over road damage or infrastructure with automatic reverse-geocoded addresses.
                </p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3">
                <div className="p-3 bg-emerald-50 text-success rounded-circle d-inline-flex mb-3">
                  <CheckCircle2 size={28} />
                </div>
                <h5 className="fw-bold text-slate-900">Enforced SLAs</h5>
                <p className="text-muted small">
                  Strict resolution deadlines from 12 hours for critical emergencies up to 72 hours for standard maintenance.
                </p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3">
                <div className="p-3 bg-purple-50 text-purple rounded-circle d-inline-flex mb-3" style={{ color: '#8b5cf6' }}>
                  <Users size={28} />
                </div>
                <h5 className="fw-bold text-slate-900">Community Support</h5>
                <p className="text-muted small">
                  Upvote existing neighborhood complaints to boost municipal visibility and prevent duplicate submissions.
                </p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="p-3">
                <div className="p-3 bg-rose-50 text-danger rounded-circle d-inline-flex mb-3">
                  <ShieldCheck size={28} />
                </div>
                <h5 className="fw-bold text-slate-900">Privacy Safeguards</h5>
                <p className="text-muted small">
                  Residential coordinates are safely blurred publicly. Personal phone and email details are never exposed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Public Complaints Grid */}
      <section className="py-5 bg-slate-50">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h3 className="fw-bold text-slate-900 mb-1">Recent Public Complaints</h3>
              <p className="text-muted small mb-0">Live infrastructure reports submitted by citizens across India</p>
            </div>
            <Link to="/public-feed" className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1">
              <span>View All Reports</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="row g-3">
            {recentComplaints.map((item) => (
              <div key={item.id} className="col-md-6 col-lg-4">
                <div className="civic-card p-3.5 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <span className="small fw-bold text-primary">{item.complaint_number}</span>
                      <StatusBadge status={item.status} />
                    </div>
                    <h6 className="fw-bold text-slate-900 mb-1">{item.title}</h6>
                    <p className="small text-muted mb-2 text-truncate-2" style={{
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                    }}>
                      {item.description}
                    </p>
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="badge bg-light text-secondary border small">{item.category_name}</span>
                      <span className="badge bg-light text-secondary border small">{item.city_name}</span>
                    </div>
                    {item.landmark && (
                      <div className="small text-muted mb-2">📍 {item.landmark}</div>
                    )}
                  </div>
                  <div className="pt-2 border-top d-flex justify-content-between align-items-center">
                    <small className="text-muted">{item.support_count || 0} supporters</small>
                    <Link to={`/complaints/${item.id}`} className="btn btn-sm btn-link text-primary p-0 text-decoration-none fw-semibold">
                      Track Progress &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
