import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldAlert, Heart } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-4 mt-auto border-top border-slate-800">
      <div className="container">
        <div className="row align-items-center gy-3">
          <div className="col-md-6 text-center text-md-start">
            <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2 mb-1">
              <ShieldAlert size={18} className="text-primary" />
              <span className="fw-bold text-white">Public Complaint Management System (PCMS)</span>
            </div>
            <p className="small text-muted mb-0">
              Multi-tenant civic technology platform connecting citizens and municipalities across India.
            </p>
          </div>
          <div className="col-md-6 text-center text-md-end">
            <div className="small text-muted mb-1">
              Map data &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="text-sky-400 text-decoration-none">OpenStreetMap</a> contributors.
            </div>
            <div className="small text-slate-400">
              Built with precision for transparent and accountable governance.
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
