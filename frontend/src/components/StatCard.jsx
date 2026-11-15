import React from 'react'

const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => {
  return (
    <div className={`stat-card stat-${color} h-100 shadow-sm`}>
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <p className="text-muted small text-uppercase fw-semibold mb-1">{title}</p>
          <h3 className="fw-bold mb-0 text-slate-800">{value}</h3>
          {subtitle && <small className="text-muted">{subtitle}</small>}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-3 bg-light text-primary`}>
            <Icon size={24} />
          </div>
        )}
      </div>
    </div>
  )
}

export default StatCard
