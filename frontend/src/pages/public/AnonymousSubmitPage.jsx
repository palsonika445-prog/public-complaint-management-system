import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'
import MapPicker from '../../components/MapPicker'
import DuplicateModal from '../../components/DuplicateModal'
import { EyeOff, AlertTriangle, Copy, Check, ArrowRight, ShieldCheck } from 'lucide-react'

const AnonymousSubmitPage = () => {
  const { t } = useTranslation()
  const [cities, setCities] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Form fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [cityId, setCityId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [priority, setPriority] = useState('medium')
  const [landmark, setLandmark] = useState('')
  const [latitude, setLatitude] = useState(22.7196)
  const [longitude, setLongitude] = useState(75.8577)
  const [address, setAddress] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [cityAutoDetectedMsg, setCityAutoDetectedMsg] = useState(null)

  // Duplication modal
  const [potentialDuplicates, setPotentialDuplicates] = useState([])
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)

  // Anonymous success result
  const [submissionResult, setSubmissionResult] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [citiesRes, catsRes] = await Promise.all([
          api.get('/cities'),
          api.get('/categories')
        ])
        setCities(citiesRes.data.cities)
        setCategories(catsRes.data.categories)
        if (citiesRes.data.cities.length > 0) {
          setCityId(citiesRes.data.cities[0].id)
          setLatitude(citiesRes.data.cities[0].latitude)
          setLongitude(citiesRes.data.cities[0].longitude)
        }
        if (catsRes.data.categories.length > 0) setCategoryId(catsRes.data.categories[0].id)
      } catch (err) {
        console.error(err)
      }
    }
    fetchMeta()
  }, [])

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

    // Run duplicate check first
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
      console.warn('Duplicate check non-blocking warning', err)
    }

    // Proceed to final submit
    await doSubmitComplaint()
  }

  const doSubmitComplaint = async () => {
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
        visibility: 'public',
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        address,
        landmark,
      }

      const res = await api.post('/complaints', payload)
      const data = res.data

      // Upload photo if selected
      if (photoFile && data.complaint_id) {
        const formData = new FormData()
        formData.append('file', photoFile)
        formData.append('is_public', 'true')
        await api.post(`/complaints/${data.complaint_id}/attachments`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
      }

      setSubmissionResult(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit anonymous complaint.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCredentials = () => {
    if (!submissionResult) return
    const text = `Complaint ID: ${submissionResult.complaint_number}\nTracking Token: ${submissionResult.tracking_token}`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <div className="container py-4">
      {/* Duplicate Check Warning Modal */}
      <DuplicateModal
        show={showDuplicateModal}
        duplicates={potentialDuplicates}
        onSupportExisting={(dupId) => {
          setShowDuplicateModal(false)
          window.location.href = `/complaints/${dupId}`
        }}
        onProceedAnyway={doSubmitComplaint}
        onClose={() => setShowDuplicateModal(false)}
      />

      {/* Success Modal / Banner */}
      {submissionResult ? (
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="civic-card p-4 p-md-5 text-center shadow-lg border-2 border-primary">
              <div className="p-3 bg-emerald-50 text-success rounded-circle d-inline-flex mb-3">
                <ShieldCheck size={36} />
              </div>
              <h3 className="fw-bold text-slate-900 mb-2">Complaint Registered Anonymously</h3>
              <p className="text-muted small mb-4">
                Your report has been successfully transmitted to the local municipality.
              </p>

              <div className="alert alert-warning text-start p-3.5 mb-4">
                <div className="d-flex align-items-center gap-2 mb-2 text-amber-900 fw-bold">
                  <AlertTriangle size={18} />
                  <span>CRITICAL: Save Your Tracking Credentials Now</span>
                </div>
                <p className="small mb-3 text-slate-700">
                  Because you submitted without an account, this secret token will <strong>never be shown again</strong>. You will need both your Complaint ID and Token to view resolution updates.
                </p>
                <div className="bg-white p-3 rounded-2 border mb-2 font-monospace small">
                  <div><strong>Complaint ID:</strong> {submissionResult.complaint_number}</div>
                  <div><strong>Tracking Token:</strong> <span className="text-danger fw-bold">{submissionResult.tracking_token}</span></div>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-dark d-inline-flex align-items-center gap-1.5"
                  onClick={handleCopyCredentials}
                >
                  {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
                </button>
              </div>

              <div className="d-flex justify-content-center gap-3">
                <Link to="/anonymous/track" className="btn btn-civic btn-sm px-4">
                  Go to Tracking Page
                </Link>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => {
                    setSubmissionResult(null)
                    setTitle('')
                    setDescription('')
                    setLandmark('')
                  }}
                >
                  File Another Complaint
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Submission Form */
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="civic-card p-4 p-md-5 shadow-sm">
              <div className="d-flex align-items-center gap-2.5 mb-3">
                <div className="p-2 bg-slate-100 text-slate-800 rounded-2">
                  <EyeOff size={22} />
                </div>
                <div>
                  <h4 className="fw-bold text-slate-900 mb-0">{t('anonymous.title')}</h4>
                  <p className="small text-muted mb-0">{t('anonymous.subtitle')}</p>
                </div>
              </div>

              {error && (
                <div className="alert alert-danger py-2 small mb-3">{error}</div>
              )}

              <form onSubmit={handleSubmitAttempt}>
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">{t('form.city')}</label>
                    <select
                      className="form-select"
                      required
                      value={cityId}
                      onChange={handleCityChange}
                    >
                      {cities.map((c) => (
                        <option key={c.id} value={c.id}>{c.name} ({c.state})</option>
                      ))}
                    </select>
                    {cityAutoDetectedMsg && (
                      <div className="alert alert-info py-1.5 px-3 small mt-2 mb-1 d-flex align-items-center gap-1.5">
                        <span>📍 {cityAutoDetectedMsg}</span>
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

                {/* Map Picker */}
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
                      <option value="high">High (Hazardous / 24h SLA)</option>
                      <option value="critical">Critical (Immediate safety emergency)</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold">{t('form.uploadPhoto')}</label>
                  <input
                    type="file"
                    className="form-control"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => setPhotoFile(e.target.files[0])}
                  />
                  <small className="text-muted">Attach photograph as evidence (optional).</small>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <Link to="/" className="btn btn-outline-secondary">
                    {t('form.cancel')}
                  </Link>
                  <button type="submit" className="btn btn-civic px-4 py-2 fw-semibold" disabled={loading}>
                    {loading ? t('form.submitting') : 'Check Duplicates & Submit Report'}
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

export default AnonymousSubmitPage
