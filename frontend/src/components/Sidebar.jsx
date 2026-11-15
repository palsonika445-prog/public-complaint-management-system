import React from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Building2,
  Users,
  ShieldCheck,
  BarChart3,
  FileSpreadsheet,
  Settings,
  History,
  CheckCircle,
  Clock,
} from 'lucide-react'

const Sidebar = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  if (!user) return null

  const role = user.role

  return (
    <aside className="dashboard-sidebar d-none d-md-block py-3">
      <div className="px-3 mb-3 pb-2 border-bottom border-slate-700">
        <small className="text-uppercase text-slate-400 fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>
          {user.city_name ? `${user.city_name}` : 'Platform Control'}
        </small>
        <div className="fw-semibold text-white small">{user.full_name}</div>
        <div className="badge bg-slate-800 text-sky-400 border border-slate-700 small mt-1">
          {t(`roles.${role}`, role)}
        </div>
      </div>

      <nav className="nav flex-column">
        {/* CITIZEN LINKS */}
        {role === 'citizen' && (
          <>
            <NavLink to="/citizen/dashboard" className="nav-link">
              <LayoutDashboard size={18} />
              <span>{t('nav.dashboard')}</span>
            </NavLink>
            <NavLink to="/citizen/submit" className="nav-link">
              <PlusCircle size={18} />
              <span>{t('nav.fileComplaint')}</span>
            </NavLink>
            <NavLink to="/citizen/complaints" className="nav-link">
              <FileText size={18} />
              <span>{t('nav.myComplaints')}</span>
            </NavLink>
          </>
        )}

        {/* STAFF LINKS */}
        {role === 'staff' && (
          <>
            <NavLink to="/staff/dashboard" className="nav-link">
              <LayoutDashboard size={18} />
              <span>{t('nav.dashboard')}</span>
            </NavLink>
            <NavLink to="/staff/complaints" className="nav-link">
              <FileText size={18} />
              <span>{t('nav.assignedComplaints')}</span>
            </NavLink>
          </>
        )}

        {/* CITY ADMIN LINKS */}
        {role === 'city_admin' && (
          <>
            <NavLink to="/city-admin/dashboard" className="nav-link">
              <LayoutDashboard size={18} />
              <span>{t('nav.dashboard')}</span>
            </NavLink>
            <NavLink to="/city-admin/complaints" className="nav-link">
              <FileText size={18} />
              <span>{t('nav.allComplaints')}</span>
            </NavLink>
            <NavLink to="/city-admin/assign" className="nav-link">
              <CheckCircle size={18} />
              <span>{t('common.assign')}</span>
            </NavLink>
            <NavLink to="/city-admin/departments" className="nav-link">
              <Building2 size={18} />
              <span>{t('nav.departments')}</span>
            </NavLink>
            <NavLink to="/city-admin/staff" className="nav-link">
              <Users size={18} />
              <span>{t('nav.staff')}</span>
            </NavLink>
            <NavLink to="/city-admin/sla" className="nav-link">
              <Clock size={18} />
              <span>{t('nav.slaPolicies')}</span>
            </NavLink>
            <NavLink to="/city-admin/reports" className="nav-link">
              <FileSpreadsheet size={18} />
              <span>{t('nav.reports')}</span>
            </NavLink>
            <NavLink to="/city-admin/settings" className="nav-link">
              <Settings size={18} />
              <span>{t('nav.citySettings')}</span>
            </NavLink>
          </>
        )}

        {/* SUPER ADMIN LINKS */}
        {role === 'super_admin' && (
          <>
            <NavLink to="/super-admin/dashboard" className="nav-link">
              <LayoutDashboard size={18} />
              <span>{t('nav.dashboard')}</span>
            </NavLink>
            <NavLink to="/super-admin/cities" className="nav-link">
              <Building2 size={18} />
              <span>{t('nav.cities')}</span>
            </NavLink>
            <NavLink to="/super-admin/city-admins" className="nav-link">
              <ShieldCheck size={18} />
              <span>{t('nav.cityAdmins')}</span>
            </NavLink>
            <NavLink to="/super-admin/complaints" className="nav-link">
              <FileText size={18} />
              <span>{t('nav.allComplaints')}</span>
            </NavLink>
            <NavLink to="/super-admin/users" className="nav-link">
              <Users size={18} />
              <span>{t('nav.users')}</span>
            </NavLink>
            <NavLink to="/super-admin/audit-logs" className="nav-link">
              <History size={18} />
              <span>{t('nav.auditLogs')}</span>
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  )
}

export default Sidebar
