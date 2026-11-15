import React from 'react'
import { useTranslation } from 'react-i18next'
import { AlertCircle, AlertTriangle, Info, Flame } from 'lucide-react'

const PriorityBadge = ({ priority }) => {
  const { t } = useTranslation()
  const safePriority = priority ? priority.toLowerCase() : 'medium'
  const label = t(`priority.${safePriority}`, safePriority.toUpperCase())

  const getIcon = () => {
    switch (safePriority) {
      case 'critical':
        return <Flame size={12} className="me-1" />
      case 'high':
        return <AlertCircle size={12} className="me-1" />
      case 'medium':
        return <AlertTriangle size={12} className="me-1" />
      case 'low':
      default:
        return <Info size={12} className="me-1" />
    }
  }

  return (
    <span className={`badge rounded-pill d-inline-flex align-items-center px-2 py-1 badge-priority-${safePriority}`}>
      {getIcon()}
      {label}
    </span>
  )
}

export default PriorityBadge
