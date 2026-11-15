import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import PublicMap from '../../components/PublicMap'
import { Filter, MapPin, RefreshCw } from 'lucide-react'

const PublicMapPage = () => {
  const { t } = useTranslation()
  const [pins, setPins] = useState([])
  const [cities, setCities] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [mapCenter, setMapCenter] = useState([22.7196, 75.8577]) // Indore default
  const [loading, setLoading] = useState(true)

  const fetchFilters = async () => {
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

  const fetchPins = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCity) params.append('city_id', selectedCity)
      if (selectedCategory) params.append('category_id', selectedCategory)
      if (selectedStatus) params.append('status', selectedStatus)

      const res = await api.get(`/complaints/public-map?${params.toString()}`)
      setPins(res.data.pins)

      // Adjust map center if city changed
      if (selectedCity) {
        const cityObj = cities.find(c => c.id === parseInt(selectedCity))
        if (cityObj) {
          setMapCenter([cityObj.latitude, cityObj.longitude])
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFilters()
  }, [])

  useEffect(() => {
    fetchPins()
  }, [selectedCity, selectedCategory, selectedStatus])

  return (
    <div className="container-fluid py-3 px-md-4">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <div>
          <h4 className="fw-bold mb-0 text-slate-900 d-flex align-items-center gap-2">
            <MapPin size={22} className="text-primary" />
            Civic Public Complaint Map
          </h4>
          <p className="small text-muted mb-0">
            Real-time geolocation of active infrastructure issues. Coordinates are generalized (~100m) to preserve citizen privacy.
          </p>
        </div>

        {/* Legend */}
        <div className="d-flex align-items-center gap-3 bg-white p-2 rounded-3 border small">
          <span className="d-flex align-items-center gap-1">
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#0284c7' }} />
            Submitted / Assigned
          </span>
          <span className="d-flex align-items-center gap-1">
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f59e0b' }} />
            In Progress
          </span>
          <span className="d-flex align-items-center gap-1">
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10b981' }} />
            Resolved
          </span>
          <span className="d-flex align-items-center gap-1">
            <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ef4444' }} />
            Critical Priority
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="civic-card p-3 mb-3">
        <div className="row g-2 align-items-center">
          <div className="col-md-3">
            <select
              className="form-select form-select-sm"
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="">All Cities / Municipalities</option>
              {cities.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.state})</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <select
              className="form-select form-select-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <select
              className="form-select form-select-sm"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="submitted">Submitted</option>
              <option value="under_review">Under Review</option>
              <option value="assigned">Assigned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          <div className="col-md-3 text-end">
            <button
              className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1"
              onClick={fetchPins}
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              <span>Refresh Map ({pins.length} Issues)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Map */}
      <div style={{ height: 'calc(100vh - 270px)', minHeight: '500px' }}>
        <PublicMap pins={pins} center={mapCenter} zoom={12} />
      </div>
    </div>
  )
}

export default PublicMapPage
