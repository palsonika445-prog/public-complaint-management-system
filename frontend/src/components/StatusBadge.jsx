import React from 'react'
import { useTranslation } from 'react-i18next'

const StatusBadge = ({ status }) => {
  const { t } = useTranslation()
  const safeStatus = status ? status.toLowerCase() : 'submitted'
  const label = t(`status.${safeStatus}`, safeStatus.replace('_', ' ').toUpperCase())

  return (
    <span className={`badge rounded-pill px-2.5 py-1.5 badge-status-${safeStatus}`}>
      {label}
    </span>
  )
}

export default StatusBadge
