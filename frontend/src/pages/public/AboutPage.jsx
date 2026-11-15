import React from 'react'
import { ShieldCheck, CheckCircle2, Clock, Globe, Lock, Cpu, Server } from 'lucide-react'

const AboutPage = () => {
  return (
    <div className="py-5 bg-slate-50">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-5" style={{ maxWidth: '750px', margin: '0 auto' }}>
          <span className="badge bg-primary px-3 py-1.5 rounded-pill mb-2">Architectural Overview</span>
          <h2 className="fw-bold display-6 text-slate-900 mb-3">Enterprise Public Complaint Management</h2>
          <p className="lead text-secondary" style={{ fontSize: '1.1rem' }}>
            A production-ready civic technology platform engineered for multi-tenant isolation, transparent governance, and reliable municipal service delivery across Indian cities.
          </p>
        </div>

        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <div className="civic-card p-4 h-100">
              <div className="p-3 bg-blue-50 text-primary rounded-3 d-inline-flex mb-3">
                <Server size={24} />
              </div>
              <h5 className="fw-bold text-slate-900">Multi-Tenant Isolation</h5>
              <p className="text-muted small">
                Every municipal corporation operates in strict server-side tenant isolation. City Admins and department staff can never query or manipulate records belonging to unauthorized jurisdictions.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="civic-card p-4 h-100">
              <div className="p-3 bg-amber-50 text-warning rounded-3 d-inline-flex mb-3">
                <Clock size={24} />
              </div>
              <h5 className="fw-bold text-slate-900">Configurable SLA & Escalation</h5>
              <p className="text-muted small">
                Each category and priority level carries automated SLA calculation. If an issue passes its deadline without resolution, the system records an escalation event and flags it immediately.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="civic-card p-4 h-100">
              <div className="p-3 bg-emerald-50 text-success rounded-3 d-inline-flex mb-3">
                <Lock size={24} />
              </div>
              <h5 className="fw-bold text-slate-900">Privacy & Cryptographic Tokens</h5>
              <p className="text-muted small">
                Complainant residential GPS coordinates are automatically fuzzed on public maps. Anonymous submissions generate single-view cryptographically salted SHA-256 tokens for tracking without accounts.
              </p>
            </div>
          </div>
        </div>

        {/* Workflow Diagram Card */}
        <div className="civic-card p-4 p-md-5 mb-5 shadow-sm">
          <h4 className="fw-bold text-slate-900 mb-4 text-center">Standard Civic Resolution Lifecycle</h4>
          <div className="row text-center gy-4">
            <div className="col-6 col-md">
              <div className="p-2 fw-bold text-primary">1. Submission</div>
              <div className="small text-muted">Citizen reports issue with GPS coordinates & photo</div>
            </div>
            <div className="col-6 col-md">
              <div className="p-2 fw-bold text-warning">2. City Review</div>
              <div className="small text-muted">City Admin reviews & allocates department & staff</div>
            </div>
            <div className="col-6 col-md">
              <div className="p-2 fw-bold text-info">3. Field Work</div>
              <div className="small text-muted">Department staff investigates & updates progress</div>
            </div>
            <div className="col-6 col-md">
              <div className="p-2 fw-bold text-success">4. Resolution</div>
              <div className="small text-muted">Staff submits resolution evidence remarks</div>
            </div>
            <div className="col-6 col-md">
              <div className="p-2 fw-bold text-secondary">5. Citizen Feedback</div>
              <div className="small text-muted">Citizen rates resolution or reopens within SLA window</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutPage
