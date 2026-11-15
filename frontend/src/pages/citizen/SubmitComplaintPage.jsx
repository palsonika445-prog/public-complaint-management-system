import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import MapPicker from '../../components/MapPicker'
import DuplicateModal from '../../components/DuplicateModal'
import AddCityModal from '../../components/AddCityModal'
import DigiLockerKycModal from '../../components/DigiLockerKycModal'
import { PlusCircle, AlertCircle, ArrowLeft, Image as ImageIcon, ShieldCheck, AlertTriangle, Zap } from 'lucide-react'

const SubmitComplaintPage = () => {
  const { t } = useTranslation()
  const { user, updateProfile } = useAuth()
  const navigate = useNavigate()

  const [cities, setCities] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [cityAutoDetectedMsg, setCityAutoDetectedMsg] = useState(null)
  const [updateProfileCity, setUpdateProfileCity] = useState(false)
  const [showAddCityModal, setShowAddCityModal] = useState(false)
  const [showKycModal, setShowKycModal] = useState(false)

  // Form states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [cityId, setCityId] = useState(user?.city_id || '')
  const [categoryId, setCategoryId] = useState('')
  const [priority, setPriority] = useState('medium')
  const [visibility, setVisibility] = useState('public')
  const [landmark, setLandmark] = useState('')
  const [latitude, setLatitude] = useState(22.7196)
  const [longitude, setLongitude] = useState(75.8577)
  const [address, setAddress] = useState('')
  const [photoFile, setPhotoFile] = useState(null)

  // Duplication states
  const [potentialDuplicates, setPotentialDuplicates] = useState([])
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [citiesRes, catsRes] = await Promise.all([
          api.get('/cities'),
          api.get('/categories')
        ])
        setCities(citiesRes.data.cities)
        setCategories(catsRes.data.categories)

        if (!cityId && citiesRes.data.cities.length > 0) {
          setCityId(citiesRes.data.cities[0].id)
        }
        if (catsRes.data.categories.length > 0) {
          setCategoryId(catsRes.data.categories[0].id)
        }

        // Set map coordinates to user's city if available
        if (user?.city_id) {
          const userCity = citiesRes.data.cities.find(c => c.id === user.city_id)
          if (userCity) {
            setLatitude(userCity.latitude)
            setLongitude(userCity.longitude)
          }
        }
      } catch (err) {
        console.error(err)
      }
    }
    fetchMetadata()
  }, [user])

  const handleLocationSelect = (loc) => {
    setLatitude(loc.latitude)
    setLongitude(loc.longitude)
    setAddress(loc.address)

    // Auto-detect matching city from reverse-geocoded address
    if (loc.city || loc.address) {
      const fullAddr = ((loc.city || '') + ' ' + (loc.address || '')).toLowerCase()
      const matched = cities.find(c => {
        const cNameLower = c.name.toLowerCase()
        const cSlug = c.slug.toLowerCase()
        return fullAddr.includes(cSlug) ||
               fullAddr.includes(cNameLower.split(' ')[0]) ||
               (cSlug === 'navi-mumbai' && (fullAddr.includes('navi mumbai') || fullAddr.includes('vashi') || fullAddr.includes('nerul'))) ||
               (cSlug === 'jhajjar' && fullAddr.includes('jhajjar')) ||
               (cSlug === 'indore' && fullAddr.includes('indore'))
      })
      if (matched && matched.id !== parseInt(cityId)) {
        setCityId(matched.id)
        setCityAutoDetectedMsg(`GPS Location matched: Auto-selected ${matched.name}`)
        setTimeout(() => setCityAutoDetectedMsg(null), 5000)
      }
    }
  }

  const handleCityChange = (e) => {
    const cid = parseInt(e.target.value)
    setCityId(cid)
    const selectedCityObj = cities.find(c => c.id === cid)
    if (selectedCityObj) {
      setLatitude(selectedCityObj.latitude)
      setLongitude(selectedCityObj.longitude)
    }
  }

  const handleSubmitAttempt = async (e) => {
    e.preventDefault()
    setError(null)

    // Check duplicates first
    try {
      const dupRes = await api.post('/complaints/check-duplicates', {
        city_id: parseInt(cityId),
        category_id: parseInt(categoryId),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        radius_meters: 1000,
      })
      if (dupRes.data.count > 0) {
        setPotentialDuplicates(dupRes.data.potential_duplicates)
        setShowDuplicateModal(true)
        return
      }
    } catch (err) {
      console.warn('Duplicate check non-blocking error', err)
    }

    await doFinalSubmit()
  }

  const doFinalSubmit = async () => {
    setLoading(true)
    setError(null)
    setShowDuplicateModal(false)

    try {
      const payload = {
        title,
        description,
        city_id: parseInt(cityId),
        category_id: parseInt(categoryId),
        priority,
        visibility,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address,
        landmark,
      }

      const res = await api.post('/complaints', payload)
      const complaintId = res.data.complaint_id

      // Upload photo if provided
      if (photoFile && complaintId) {
        const formData = new FormData()
        formData.append('file', photoFile)
        formData.append('is_public', visibility === 'public' ? 'true' : 'false')
        await api.post(`/complaints/${complaintId}/attachments`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }

      // If user chose to update their default home municipality
      if (updateProfileCity && cityId && parseInt(cityId) !== user?.city_id) {
        try {
          await updateProfile({ city_id: parseInt(cityId) })
        } catch (e) {
          console.warn('Profile city update ignored', e)
        }
      }

      navigate(`/complaints/${complaintId}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit complaint.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-3">
      {/* Duplication Warning Modal */}
      <DuplicateModal
        show={showDuplicateModal}
        duplicates={potentialDuplicates}
        onSupportExisting={(dupId) => {
          setShowDuplicateModal(false)
          navigate(`/complaints/${dupId}`)
        }}
        onProceedAnyway={doFinalSubmit}
        onClose={() => setShowDuplicateModal(false)}
      />

      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div className="civic-card p-4 p-md-5 shadow-sm">
            <div className="d-flex align-items-center gap-2 mb-4">
              <div className="p-2 bg-sky-50 text-primary rounded-2">
                <PlusCircle size={22} />
              </div>
              <div>
                <h4 className="fw-bold text-slate-900 mb-0">{t('nav.fileComplaint')}</h4>
                <p className="small text-muted mb-0">Fill in the incident details to notify your local municipal department</p>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger py-2 small mb-3 d-flex align-items-center gap-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Citizen Authenticity / DigiLocker Trust Card */}
            <div className="mb-4">
              {user?.is_aadhaar_verified ? (
                <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <div className="d-flex align-items-center gap-2">
                    <ShieldCheck size={20} className="text-emerald-600 flex-shrink-0" />
                    <div>
                      <div className="fw-bold text-emerald-950 small">
                        Filing as DigiLocker Verified Citizen (Aadhaar **** {user?.aadhaar_last4 || '4819'})
                      </div>
                      <div className="text-emerald-800" style={{ fontSize: '0.78rem' }}>
                        Anti-Spam Verified &bull; Automatic High-Priority SLA Routing
                      </div>
                    </div>
                  </div>
                  <span className="badge bg-emerald-600 text-white rounded-pill px-2.5 py-1" style={{ fontSize: '0.72rem' }}>
                    98% Civic Trust Score
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <div className="d-flex align-items-center gap-2">
                    <AlertTriangle size={20} className="text-amber-600 flex-shrink-0" />
                    <div>
                      <div className="fw-bold text-amber-950 small">
                        Unverified Account (Standard SLA Queue)
                      </div>
                      <div className="text-amber-800" style={{ fontSize: '0.78rem' }}>
                        Verify with DigiLocker to skip spam checks and get fast-track Level 1 resolution.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-sm btn-warning text-slate-900 fw-bold px-2.5 py-1 d-flex align-items-center gap-1 shadow-xs"
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => setShowKycModal(true)}
                  >
                    <Zap size={13} />
                    <span>Verify Aadhaar</span>
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmitAttempt}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label small fw-semibold mb-0">{t('form.city')}</label>
                    <button
                      type="button"
                      className="btn btn-link btn-xs p-0 text-primary text-decoration-none small fw-semibold"
                      onClick={() => setShowAddCityModal(true)}
                    >
                      + Add New City
                    </button>
                  </div>
                  <select
                    className="form-select"
                    required
                    value={cityId}
                    onChange={(e) => {
                      if (e.target.value === 'ADD_NEW') {
                        setShowAddCityModal(true)
                      } else {
                        handleCityChange(e)
                      }
                    }}
                  >
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>{c.name} ({c.state})</option>
                    ))}
                    <option value="ADD_NEW">+ Add Another Municipality (नया शहर जोड़ें)...</option>
                  </select>
                  {cityAutoDetectedMsg && (
                    <div className="alert alert-info py-1.5 px-3 small mt-2 mb-1 d-flex align-items-center gap-1.5">
                      <span>📍 {cityAutoDetectedMsg}</span>
                    </div>
                  )}
                  {user && cityId && parseInt(cityId) !== user.city_id && (
                    <div className="form-check mt-2">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="updateDefaultCity"
                        checked={updateProfileCity}
                        onChange={(e) => setUpdateProfileCity(e.target.checked)}
                      />
                      <label className="form-check-label small text-muted" htmlFor="updateDefaultCity">
                        Set this municipality as my default home city
                      </label>
                    </div>
                  )}
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">{t('form.category')}</label>
                  <select
                    className="form-select"
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">{t('form.title')}</label>
                <input
                  type="text"
                  className="form-control"
                  required
                  minLength={5}
                  placeholder={t('form.titlePlaceholder')}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">{t('form.description')}</label>
                <textarea
                  className="form-control"
                  rows={4}
                  required
                  minLength={10}
                  placeholder={t('form.descriptionPlaceholder')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Map Location Picker */}
              <div className="mb-3">
                <label className="form-label small fw-semibold">{t('form.location')}</label>
                <MapPicker
                  initialLat={latitude}
                  initialLng={longitude}
                  onSelectLocation={handleLocationSelect}
                  selectedAddress={address}
                />
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Nearby Landmark</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={t('form.landmarkPlaceholder')}
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">{t('form.prioritySuggestion')}</label>
                  <select
                    className="form-select"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                  >
                    <option value="low">Low (Routine maintenance)</option>
                    <option value="medium">Medium (Standard 72h SLA)</option>
                    <option value="high">High (Significant hazard / 24h SLA)</option>
                    <option value="critical">Critical (Immediate safety emergency / 12h SLA)</option>
                  </select>
                </div>
              </div>

              {/* Visibility and Photo Upload */}
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">{t('form.visibility')}</label>
                  <div className="d-flex gap-3 mt-1">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="visibility"
                        id="visPublic"
                        value="public"
                        checked={visibility === 'public'}
                        onChange={(e) => setVisibility(e.target.value)}
                      />
                      <label className="form-check-label small" htmlFor="visPublic">
                        Public (Recommended)
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="visibility"
                        id="visPrivate"
                        value="private"
                        checked={visibility === 'private'}
                        onChange={(e) => setVisibility(e.target.value)}
                      />
                      <label className="form-check-label small" htmlFor="visPrivate">
                        Private (Officials only)
                      </label>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-semibold">{t('form.uploadPhoto')}</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => setPhotoFile(e.target.files[0])}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-3 border-top">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => navigate('/citizen/dashboard')}
                >
                  {t('form.cancel')}
                </button>
                <button
                  type="submit"
                  className="btn btn-civic px-4 py-2 fw-semibold"
                  disabled={loading}
                >
                  {loading ? t('form.submitting') : 'Check Duplicates & Submit Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <AddCityModal
        show={showAddCityModal}
        onClose={() => setShowAddCityModal(false)}
        onCityAdded={(newCity) => {
          setCities(prev => [...prev, newCity])
          setCityId(newCity.id)
          setLatitude(newCity.latitude)
          setLongitude(newCity.longitude)
        }}
      />

      <DigiLockerKycModal
        isOpen={showKycModal}
        onClose={() => setShowKycModal(false)}
      />
    </div>
  )
}

export default SubmitComplaintPage
