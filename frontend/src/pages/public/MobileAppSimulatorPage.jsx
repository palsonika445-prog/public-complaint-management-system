import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { 
  Smartphone, ShieldCheck, Camera, MapPin, AlertTriangle, 
  Clock, CheckCircle, ChevronRight, PhoneCall, Bell, 
  Send, Sparkles, QrCode, ArrowLeft, RefreshCw, FileText, 
  Flame, Zap, Droplets, Check, ExternalLink, Share2
} from 'lucide-react'
import api from '../../services/api'
import GrievanceReceiptModal from '../../components/GrievanceReceiptModal'
import WhatsAppNotificationToast from '../../components/WhatsAppNotificationToast'

const MobileAppSimulatorPage = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  // Simulator controls
  const [deviceModel, setDeviceModel] = useState('iphone') // 'iphone' | 'android'
  const [activeTab, setActiveTab] = useState('home') // 'home' | 'submit' | 'track' | 'profile'
  const [currentTime, setCurrentTime] = useState('09:41')
  
  // Interactive app state inside phone
  const [showReceipt, setShowReceipt] = useState(false)
  const [showWhatsAppAlert, setShowWhatsAppAlert] = useState(false)
  const [alertSent, setAlertSent] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('Road & Potholes')
  const [quickTitle, setQuickTitle] = useState('')
  const [submittedMessage, setSubmittedMessage] = useState(null)

  // Demo Complaint for Mobile View
  const demoComplaint = {
    id: 1,
    complaint_number: 'CMP-2026-000001',
    title: 'Severe pothole cluster near Vijay Nagar Square',
    category_name: 'Roads & Footpaths',
    department_name: 'Public Works Dept (PWD)',
    assigned_department_name: 'Public Works Dept (PWD)',
    citizen_name: 'Sonika',
    city_name: 'Indore Municipal Corporation',
    status: 'in_progress',
    priority: 'critical',
    latitude: 22.7533,
    longitude: 75.8937,
    address: 'Near Orbit Mall, AB Road, Vijay Nagar, Indore',
    landmark: 'Opposite Metro Pillar 142',
    sla_hours: 6,
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    sla_due_at: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    citizen_is_aadhaar_verified: true,
    aadhaar_last4: '4819'
  }

  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      const hrs = String(now.getHours()).padStart(2, '0')
      const mins = String(now.getMinutes()).padStart(2, '0')
      setCurrentTime(`${hrs}:${mins}`)
    }
    updateClock()
    const timer = setInterval(updateClock, 30000)
    return () => clearInterval(timer)
  }, [])

  const handleQuickSubmit = (e) => {
    e.preventDefault()
    if (!quickTitle.trim()) return
    setSubmittedMessage(`सफलतापूर्वक दर्ज! Complaint No: PCMS-IND-2026-${Math.floor(1000 + Math.random() * 9000)}`)
    setQuickTitle('')
    setTimeout(() => setSubmittedMessage(null), 5000)
  }

  const handleSendReminder = () => {
    setAlertSent(true)
    setShowWhatsAppAlert(true)
    setTimeout(() => setAlertSent(false), 4000)
  }

  return (
    <div className="py-4 py-lg-5" style={{ minHeight: '92vh', backgroundColor: '#0f172a' }}>
      <div className="container-fluid px-lg-5">
        
        {/* Top Header Bar */}
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4 text-white">
          <div className="d-flex align-items-center gap-3">
            <Link to="/" className="btn btn-outline-secondary btn-sm text-slate-300 border-slate-700 hover-white">
              <ArrowLeft size={16} className="me-1" /> Portal Home
            </Link>
            <div>
              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-emerald-500 text-slate-950 fw-bold px-2 py-0.5" style={{ fontSize: '0.7rem' }}>
                  PWA 2.0 LIVE
                </span>
                <h1 className="h4 mb-0 fw-bold text-white">PCMS Nagrik — Citizen Mobile App</h1>
              </div>
              <p className="text-slate-400 small mb-0">
                Official Progressive Web App (PWA) for Android & iOS Smart Governance
              </p>
            </div>
          </div>

          {/* Device Model Switcher */}
          <div className="d-flex align-items-center gap-2 bg-slate-800/80 p-1.5 rounded-3 border border-slate-700">
            <span className="text-slate-400 small me-1 ps-1">Phone Model:</span>
            <button
              className={`btn btn-xs px-2.5 py-1 rounded-2 small fw-semibold ${deviceModel === 'iphone' ? 'btn-primary text-white shadow-sm' : 'text-slate-400'}`}
              onClick={() => setDeviceModel('iphone')}
            >
              🍎 iPhone 15 Pro
            </button>
            <button
              className={`btn btn-xs px-2.5 py-1 rounded-2 small fw-semibold ${deviceModel === 'android' ? 'btn-primary text-white shadow-sm' : 'text-slate-400'}`}
              onClick={() => setDeviceModel('android')}
            >
              🤖 Google Pixel
            </button>
          </div>
        </div>

        <div className="row g-4 align-items-start justify-content-center">
          
          {/* ========================================================= */}
          {/* LEFT/CENTER COLUMN: REALISTIC 3D SMARTPHONE DEVICE FRAME */}
          {/* ========================================================= */}
          <div className="col-12 col-md-auto d-flex justify-content-center">
            
            {/* Phone Outer Chassis */}
            <div 
              className="position-relative shadow-2xl overflow-hidden"
              style={{
                width: '390px',
                height: '820px',
                backgroundColor: '#000000',
                borderRadius: deviceModel === 'iphone' ? '54px' : '44px',
                border: '11px solid #1e293b',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 2px rgba(255, 255, 255, 0.1), inset 0 0 4px rgba(255, 255, 255, 0.2)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Dynamic Island / Camera Notch */}
              <div 
                className="position-absolute start-50 translate-middle-x"
                style={{
                  top: '11px',
                  zIndex: 1050,
                  width: deviceModel === 'iphone' ? '120px' : '18px',
                  height: deviceModel === 'iphone' ? '30px' : '18px',
                  backgroundColor: '#000000',
                  borderRadius: deviceModel === 'iphone' ? '20px' : '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.5)'
                }}
              >
                {deviceModel === 'iphone' && (
                  <div className="d-flex align-items-center justify-content-between w-100 px-2.5">
                    <span className="rounded-circle bg-emerald-500" style={{ width: 6, height: 6 }}></span>
                    <span className="rounded-circle bg-slate-900 border border-slate-800" style={{ width: 11, height: 11 }}></span>
                  </div>
                )}
              </div>

              {/* Status Bar */}
              <div 
                className="d-flex justify-content-between align-items-center px-4 pt-2 pb-1 text-white select-none"
                style={{ fontSize: '0.75rem', fontWeight: 600, zIndex: 1040, minHeight: '38px', backgroundColor: '#0284c7' }}
              >
                <span>{currentTime}</span>
                <div className="d-flex align-items-center gap-1.5" style={{ fontSize: '0.7rem' }}>
                  <span>5G</span>
                  <span>📶</span>
                  <span>100% 🔋</span>
                </div>
              </div>

              {/* Native App Top Navigation Bar */}
              <div 
                className="px-3 py-2.5 text-white d-flex align-items-center justify-content-between"
                style={{ backgroundColor: '#0284c7', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className="d-flex align-items-center gap-2">
                  <div className="p-1 bg-white text-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 28, height: 28 }}>
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <div className="fw-bold text-white small" style={{ lineHeight: 1.1 }}>PCMS Nagrik</div>
                    <div className="text-sky-100" style={{ fontSize: '0.65rem' }}>📍 Indore Municipal Corp</div>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-1.5">
                  <span className="badge bg-white/20 text-white rounded-pill px-2 py-0.5 d-flex align-items-center gap-1" style={{ fontSize: '0.65rem' }}>
                    <span className="badge bg-success p-1 rounded-circle"></span>
                    Sonika ✓
                  </span>
                </div>
              </div>

              {/* ================================================= */}
              {/* PHONE SCROLLABLE BODY SCREEN */}
              {/* ================================================= */}
              <div 
                className="flex-grow-1 overflow-auto bg-slate-50 text-slate-800 p-3"
                style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
              >
                
                {/* 1. HOME TAB */}
                {activeTab === 'home' && (
                  <div className="d-flex flex-column gap-3">
                    
                    {/* Welcome Greeting Card */}
                    <div className="bg-white p-3 rounded-4 shadow-sm border border-slate-200">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <div className="text-muted" style={{ fontSize: '0.72rem' }}>नमस्ते & Welcome,</div>
                          <div className="fw-bold text-slate-900 fs-6">Sonika ji 🇮🇳</div>
                        </div>
                        <div className="text-end">
                          <span className="badge bg-emerald-100 text-emerald-800 border border-emerald-200 small">
                            Trust Score: 98%
                          </span>
                          <div className="text-muted" style={{ fontSize: '0.65rem' }}>DigiLocker Verified</div>
                        </div>
                      </div>
                    </div>

                    {/* Emergency AI Hazard SOS Banner */}
                    <div 
                      className="p-3 rounded-4 text-white position-relative overflow-hidden shadow-sm"
                      style={{ background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' }}
                    >
                      <div className="d-flex align-items-start justify-content-between">
                        <div>
                          <div className="d-flex align-items-center gap-1.5 fw-bold small text-amber-200 mb-1">
                            <Zap size={14} /> 1-Tap Emergency SLA (6h)
                          </div>
                          <div className="fw-bold fs-6">Report Urgent Hazard</div>
                          <div className="text-red-100" style={{ fontSize: '0.7rem' }}>
                            Open live wire, sewage flood, or hospital route block
                          </div>
                        </div>
                        <button 
                          className="btn btn-light btn-sm fw-bold text-danger px-2.5 py-1 rounded-pill mt-1"
                          style={{ fontSize: '0.72rem' }}
                          onClick={() => setActiveTab('submit')}
                        >
                          Report SOS
                        </button>
                      </div>
                    </div>

                    {/* Quick Action Grid (4 App Tiles) */}
                    <div>
                      <div className="text-muted fw-bold text-uppercase mb-2" style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                        Quick Civic Services
                      </div>
                      <div className="row g-2">
                        <div className="col-6">
                          <button 
                            className="btn btn-outline-light bg-white border text-start p-2.5 w-100 rounded-3 shadow-2xs hover-shadow-sm"
                            onClick={() => setActiveTab('submit')}
                          >
                            <div className="p-2 rounded-3 bg-primary-subtle text-primary d-inline-flex mb-1.5">
                              <Camera size={18} />
                            </div>
                            <div className="fw-bold text-slate-800 small">Snap & Complain</div>
                            <div className="text-muted" style={{ fontSize: '0.67rem' }}>Camera GPS Photo</div>
                          </button>
                        </div>

                        <div className="col-6">
                          <button 
                            className="btn btn-outline-light bg-white border text-start p-2.5 w-100 rounded-3 shadow-2xs hover-shadow-sm"
                            onClick={() => setActiveTab('track')}
                          >
                            <div className="p-2 rounded-3 bg-amber-100 text-amber-700 d-inline-flex mb-1.5">
                              <Clock size={18} />
                            </div>
                            <div className="fw-bold text-slate-800 small">Track Status</div>
                            <div className="text-muted" style={{ fontSize: '0.67rem' }}>Live SLA Timeline</div>
                          </button>
                        </div>

                        <div className="col-6">
                          <button 
                            className="btn btn-outline-light bg-white border text-start p-2.5 w-100 rounded-3 shadow-2xs hover-shadow-sm"
                            onClick={() => setShowReceipt(true)}
                          >
                            <div className="p-2 rounded-3 bg-emerald-100 text-emerald-700 d-inline-flex mb-1.5">
                              <FileText size={18} />
                            </div>
                            <div className="fw-bold text-slate-800 small">Official Receipt</div>
                            <div className="text-muted" style={{ fontSize: '0.67rem' }}>पावती स्लिप (Print)</div>
                          </button>
                        </div>

                        <div className="col-6">
                          <a 
                            href="tel:181"
                            className="btn btn-outline-light bg-white border text-start p-2.5 w-100 rounded-3 shadow-2xs hover-shadow-sm text-decoration-none"
                          >
                            <div className="p-2 rounded-3 bg-purple-100 text-purple-700 d-inline-flex mb-1.5">
                              <PhoneCall size={18} />
                            </div>
                            <div className="fw-bold text-slate-800 small">CM Helpline 181</div>
                            <div className="text-muted" style={{ fontSize: '0.67rem' }}>24x7 Toll Free</div>
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Active Grievance Card */}
                    <div className="bg-white p-3 rounded-4 shadow-sm border border-slate-200">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2" style={{ fontSize: '0.68rem' }}>
                          LIVE GRIEVANCE
                        </span>
                        <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2" style={{ fontSize: '0.68rem' }}>
                          Critical (6h SLA)
                        </span>
                      </div>

                      <div className="fw-bold text-slate-900 small mb-1">
                        {demoComplaint.title}
                      </div>
                      <div className="text-muted small mb-2 d-flex align-items-center gap-1" style={{ fontSize: '0.7rem' }}>
                        <MapPin size={12} /> {demoComplaint.address}
                      </div>

                      {/* Mini Stepper */}
                      <div className="p-2 rounded-3 bg-slate-50 border mb-3">
                        <div className="d-flex justify-content-between text-muted" style={{ fontSize: '0.65rem' }}>
                          <span className="text-emerald-600 fw-bold">✓ Submitted</span>
                          <span className="text-emerald-600 fw-bold">✓ Assigned PWD</span>
                          <span className="text-primary fw-bold">● In Progress</span>
                          <span className="text-muted">○ Resolved</span>
                        </div>
                        <div className="progress mt-1" style={{ height: '5px' }}>
                          <div className="progress-bar bg-primary" role="progressbar" style={{ width: '70%' }}></div>
                        </div>
                      </div>

                      {/* Quick Interactive Actions */}
                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-outline-primary btn-sm flex-grow-1 py-1 px-2 small rounded-pill d-flex align-items-center justify-content-center gap-1"
                          style={{ fontSize: '0.72rem' }}
                          onClick={handleSendReminder}
                          disabled={alertSent}
                        >
                          <Bell size={13} />
                          {alertSent ? 'Reminder Sent! ✓' : 'Send Reminder'}
                        </button>

                        <button 
                          className="btn btn-primary btn-sm flex-grow-1 py-1 px-2 small rounded-pill d-flex align-items-center justify-content-center gap-1"
                          style={{ fontSize: '0.72rem' }}
                          onClick={() => setShowReceipt(true)}
                        >
                          <FileText size={13} />
                          View Receipt
                        </button>
                      </div>
                    </div>

                  </div>
                )}

                {/* 2. SUBMIT COMPLAINT TAB */}
                {activeTab === 'submit' && (
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="fw-bold text-slate-900 small">📸 Snap & File Issue</div>
                      <span className="badge bg-primary text-white" style={{ fontSize: '0.65rem' }}>GPS Active</span>
                    </div>

                    {submittedMessage && (
                      <div className="alert alert-success p-2 small mb-3 rounded-3" style={{ fontSize: '0.72rem' }}>
                        {submittedMessage}
                      </div>
                    )}

                    <form onSubmit={handleQuickSubmit}>
                      {/* Department / Category Pill Selector */}
                      <div className="mb-2.5">
                        <label className="form-label text-muted small mb-1" style={{ fontSize: '0.7rem' }}>Select Department:</label>
                        <div className="d-flex gap-1.5 overflow-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                          {['Road & Potholes', 'Solid Waste', 'Water Supply', 'Streetlights', 'Drainage'].map(cat => (
                            <button
                              key={cat}
                              type="button"
                              className={`btn btn-xs rounded-pill px-2.5 py-1 text-nowrap small ${selectedCategory === cat ? 'btn-primary text-white' : 'btn-outline-secondary bg-white'}`}
                              style={{ fontSize: '0.7rem' }}
                              onClick={() => setSelectedCategory(cat)}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Title Input */}
                      <div className="mb-2.5">
                        <label className="form-label text-muted small mb-1" style={{ fontSize: '0.7rem' }}>Problem Description:</label>
                        <textarea
                          rows={3}
                          className="form-control form-control-sm rounded-3"
                          style={{ fontSize: '0.75rem' }}
                          placeholder="e.g. Deep crater near market road, sewage line blocked..."
                          value={quickTitle}
                          onChange={(e) => setQuickTitle(e.target.value)}
                          required
                        />
                      </div>

                      {/* Simulated Camera Upload Card */}
                      <div className="p-3 border-2 border-dashed rounded-3 text-center bg-white mb-3">
                        <div className="p-2 bg-slate-100 text-slate-600 rounded-circle d-inline-flex mb-1">
                          <Camera size={20} />
                        </div>
                        <div className="fw-semibold text-slate-800" style={{ fontSize: '0.75rem' }}>
                          Tap to Take Photo (Camera)
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.65rem' }}>
                          Auto-captures GPS Latitude 22.7196, Longitude 75.8577
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        className="btn btn-primary w-100 py-2 rounded-3 fw-bold small shadow-sm d-flex align-items-center justify-content-center gap-1.5"
                      >
                        <Send size={14} /> Submit Grievance (6h SLA)
                      </button>
                    </form>
                  </div>
                )}

                {/* 3. TRACK STATUS TAB */}
                {activeTab === 'track' && (
                  <div>
                    <div className="fw-bold text-slate-900 small mb-2.5">📋 My Registered Grievances</div>

                    {/* Complaint Card 1 */}
                    <div className="bg-white p-3 rounded-4 shadow-sm border mb-2.5">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <span className="fw-bold text-slate-900 small">CMP-2026-000001</span>
                        <span className="badge bg-warning-subtle text-warning-emphasis" style={{ fontSize: '0.65rem' }}>
                          In Progress
                        </span>
                      </div>
                      <div className="small text-slate-700 mb-1" style={{ fontSize: '0.75rem' }}>
                        Severe pothole cluster near Vijay Nagar Square
                      </div>
                      <div className="text-muted small mb-2" style={{ fontSize: '0.68rem' }}>
                        Assigned: PWD Indore (Eng. Ramesh Sharma)
                      </div>
                      <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                        <span className="text-danger fw-bold" style={{ fontSize: '0.68rem' }}>
                          ⏱️ Due: Today, 5:30 PM
                        </span>
                        <button 
                          className="btn btn-xs btn-outline-primary py-0.5 px-2 rounded-pill"
                          style={{ fontSize: '0.68rem' }}
                          onClick={() => setShowReceipt(true)}
                        >
                          View Receipt
                        </button>
                      </div>
                    </div>

                    {/* Complaint Card 2 */}
                    <div className="bg-white p-3 rounded-4 shadow-sm border mb-2.5">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <span className="fw-bold text-slate-900 small">CMP-2026-000002</span>
                        <span className="badge bg-success-subtle text-success" style={{ fontSize: '0.65rem' }}>
                          Resolved ✓
                        </span>
                      </div>
                      <div className="small text-slate-700 mb-1" style={{ fontSize: '0.75rem' }}>
                        Overflowing community garbage container in Palasia
                      </div>
                      <div className="text-muted small mb-2" style={{ fontSize: '0.68rem' }}>
                        Resolved with Before/After Photo Evidence
                      </div>
                      <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                        <span className="text-success fw-bold" style={{ fontSize: '0.68rem' }}>
                          ✓ Citizen Verified
                        </span>
                        <button 
                          className="btn btn-xs btn-outline-secondary py-0.5 px-2 rounded-pill"
                          style={{ fontSize: '0.68rem' }}
                          onClick={() => setShowReceipt(true)}
                        >
                          View Slip
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. PROFILE TAB */}
                {activeTab === 'profile' && (
                  <div className="d-flex flex-column gap-3">
                    <div className="bg-white p-3 rounded-4 shadow-sm border text-center">
                      <div className="p-3 bg-primary-subtle text-primary rounded-circle d-inline-flex mb-2">
                        <ShieldCheck size={36} />
                      </div>
                      <div className="fw-bold fs-6 text-slate-900">Sonika</div>
                      <div className="text-muted small mb-2">citizen.sonika@example.com</div>
                      <span className="badge bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-1 rounded-pill small">
                        ✓ UIDAI Aadhaar Verified (**** 4819)
                      </span>
                    </div>

                    <div className="bg-white rounded-4 shadow-sm border overflow-hidden">
                      <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                        <span className="small text-muted">Primary Municipality</span>
                        <span className="small fw-bold text-slate-900">Indore Municipal Corp</span>
                      </div>
                      <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                        <span className="small text-muted">Civic Trust Score</span>
                        <span className="small fw-bold text-emerald-600">98 / 100</span>
                      </div>
                      <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                        <span className="small text-muted">DigiLocker KYC Doc</span>
                        <span className="small fw-bold text-slate-900">Aadhaar XML Card</span>
                      </div>
                      <div className="p-3 d-flex justify-content-between align-items-center">
                        <span className="small text-muted">WhatsApp Civic Alerts</span>
                        <span className="small fw-bold text-emerald-600">Enabled (Active)</span>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* ================================================= */}
              {/* NATIVE PHONE BOTTOM TAB BAR */}
              {/* ================================================= */}
              <div 
                className="bg-white border-top d-flex justify-content-around py-2 px-1 text-center select-none"
                style={{ zIndex: 1040 }}
              >
                <button
                  type="button"
                  className={`btn btn-link p-1 text-decoration-none d-flex flex-column align-items-center ${activeTab === 'home' ? 'text-primary' : 'text-slate-400'}`}
                  onClick={() => setActiveTab('home')}
                >
                  <span className="fs-6">🏠</span>
                  <span className="fw-semibold" style={{ fontSize: '0.62rem' }}>Home</span>
                </button>

                <button
                  type="button"
                  className={`btn btn-link p-1 text-decoration-none d-flex flex-column align-items-center ${activeTab === 'submit' ? 'text-primary' : 'text-slate-400'}`}
                  onClick={() => setActiveTab('submit')}
                >
                  <span className="fs-6">➕</span>
                  <span className="fw-semibold" style={{ fontSize: '0.62rem' }}>File Issue</span>
                </button>

                <button
                  type="button"
                  className={`btn btn-link p-1 text-decoration-none d-flex flex-column align-items-center ${activeTab === 'track' ? 'text-primary' : 'text-slate-400'}`}
                  onClick={() => setActiveTab('track')}
                >
                  <span className="fs-6">🔍</span>
                  <span className="fw-semibold" style={{ fontSize: '0.62rem' }}>Track</span>
                </button>

                <button
                  type="button"
                  className={`btn btn-link p-1 text-decoration-none d-flex flex-column align-items-center ${activeTab === 'profile' ? 'text-primary' : 'text-slate-400'}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <span className="fs-6">👤</span>
                  <span className="fw-semibold" style={{ fontSize: '0.62rem' }}>Profile</span>
                </button>
              </div>

              {/* iPhone Home Indicator Bar */}
              {deviceModel === 'iphone' && (
                <div className="bg-white pb-2 d-flex justify-content-center">
                  <div className="rounded-pill bg-slate-400" style={{ width: '130px', height: '4px' }}></div>
                </div>
              )}
            </div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: TEACHER DEMONSTRATION & PRESENTATION GUIDE */}
          {/* ========================================================= */}
          <div className="col-12 col-lg-6">
            <div className="card bg-slate-900 border-slate-800 text-white shadow-xl rounded-4 p-4 mb-4">
              
              <div className="d-flex align-items-center gap-2 mb-3">
                <div className="p-2 bg-sky-500/20 text-sky-400 rounded-3 border border-sky-400/30">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="h5 fw-bold mb-0 text-white">मैम को मोबाइल ऐप कैसे दिखाएं (Demonstration Guide)</h2>
                  <div className="text-slate-400 small">Examiner / Teacher Presentation Cheat Sheet</div>
                </div>
              </div>

              <div className="d-flex flex-column gap-3 mb-4">
                
                {/* Point 1 */}
                <div className="p-3 rounded-3 bg-slate-800/80 border border-slate-700">
                  <div className="d-flex align-items-start gap-2.5">
                    <span className="badge bg-sky-500 text-slate-950 fw-bold px-2 py-1 rounded-2">1</span>
                    <div>
                      <div className="fw-semibold text-white small">लैपटॉप स्क्रीन पर ही लाइव ऐप चलाकर दिखाएं:</div>
                      <div className="text-slate-300 small mt-1">
                        बाएं (Left) हाथ पर जो फोन दिख रहा है, वह सिर्फ फोटो नहीं है बल्कि <strong>100% फुली फंक्शनल लाइव ऐप</strong> है! आप माउस से नीचे दिए टैब्स (<strong>Home, File Issue, Track, Profile</strong>) पर क्लिक करके मैम को लाइव शिकायत दर्ज करके और रसीद खोलकर दिखा सकते हैं।
                      </div>
                    </div>
                  </div>
                </div>

                {/* Point 2 */}
                <div className="p-3 rounded-3 bg-slate-800/80 border border-slate-700">
                  <div className="d-flex align-items-start gap-2.5">
                    <span className="badge bg-emerald-500 text-slate-950 fw-bold px-2 py-1 rounded-2">2</span>
                    <div>
                      <div className="fw-semibold text-white small">असली मोबाइल में चलाएं (PWA Technology):</div>
                      <div className="text-slate-300 small mt-1">
                        मैम को बताएं: <em>"मैम, हमारा पोर्टल एक मॉडर्न <strong>Progressive Web App (PWA)</strong> है। नागरिक को अलग से 50MB का ऐप प्ले स्टोर से डाउनलोड करने की ज़रूरत नहीं है।"</em>
                      </div>
                      
                      {/* Wi-Fi Link Box */}
                      <div className="p-2.5 bg-slate-950 rounded-3 border border-slate-700 mt-2 d-flex flex-wrap align-items-center justify-content-between gap-2">
                        <div>
                          <div className="text-slate-400" style={{ fontSize: '0.68rem' }}>फोन के Chrome / Safari में यह लिंक खोलें (Same Wi-Fi):</div>
                          <code className="text-emerald-400 fw-bold small">http://10.70.32.242:3000/app</code>
                        </div>
                        <span className="badge bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Active on Wi-Fi
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Point 3 */}
                <div className="p-3 rounded-3 bg-slate-800/80 border border-slate-700">
                  <div className="d-flex align-items-start gap-2.5">
                    <span className="badge bg-purple-500 text-white fw-bold px-2 py-1 rounded-2">3</span>
                    <div>
                      <div className="fw-semibold text-white small">Chrome में "Mobile View" शॉर्टकट:</div>
                      <div className="text-slate-300 small mt-1">
                        अगर मैम पूरे ब्राउज़र को ही फोन के रूप में देखना चाहें, तो कीबोर्ड पर:  
                        <kbd className="bg-slate-700 text-white px-2 py-1 rounded ms-1 me-1">Cmd + Shift + M</kbd>  
                        (Windows में <kbd className="bg-slate-700 text-white px-2 py-1 rounded mx-1">Ctrl + Shift + M</kbd>) दबाएं! इससे ऊपर iPhone 14 Pro / Pixel 7 सेलेक्ट हो जाएगा।
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Quick Interactive Triggers for Presentation */}
              <div className="p-3 rounded-3 bg-sky-950/40 border border-sky-800/60">
                <div className="fw-semibold text-sky-200 small mb-2 d-flex align-items-center gap-1.5">
                  <Zap size={14} /> Quick Demo Triggers (मैम के सामने 1-क्लिक में दिखाएं):
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <button 
                    className="btn btn-sm btn-outline-info text-sky-300 border-sky-600 rounded-pill"
                    onClick={() => { setActiveTab('home'); setShowReceipt(true); }}
                  >
                    📄 Open Grievance Receipt (पावती)
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-success text-emerald-300 border-emerald-600 rounded-pill"
                    onClick={handleSendReminder}
                  >
                    💬 Trigger WhatsApp Officer Alert
                  </button>
                  <button 
                    className="btn btn-sm btn-outline-warning text-amber-300 border-amber-600 rounded-pill"
                    onClick={() => setActiveTab('submit')}
                  >
                    🚨 Test 1-Tap SOS Hazard
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Official Grievance Receipt Modal */}
      <GrievanceReceiptModal
        complaint={demoComplaint}
        show={showReceipt}
        onClose={() => setShowReceipt(false)}
      />

      {/* WhatsApp Simulated Alert Toast */}
      <WhatsAppNotificationToast
        complaint={demoComplaint}
        show={showWhatsAppAlert}
        onClose={() => setShowWhatsAppAlert(false)}
      />

    </div>
  )
}

export default MobileAppSimulatorPage
