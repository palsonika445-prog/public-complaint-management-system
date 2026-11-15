import React from 'react'
import { useTranslation } from 'react-i18next'
import StatusBadge from './StatusBadge'
import { CheckCircle2, Clock, UserCheck } from 'lucide-react'

const Timeline = ({ items = [] }) => {
  const { t } = useTranslation()

  if (!items || items.length === 0) {
    return <p className="text-muted small">No history recorded yet.</p>
  }

  return (
    <div className="py-2">
      {items.map((item, idx) => (
        <div key={item.id || idx} className="timeline-item">
          <div className="timeline-dot" />
          <div className="d-flex justify-content-between align-items-center mb-1">
            <div className="d-flex align-items-center gap-2">
              <StatusBadge status={item.to_status} />
              {item.changed_by_name && (
                <span className="small text-muted d-flex align-items-center">
                  <UserCheck size={14} className="me-1" />
                  {item.changed_by_name} ({item.changed_by_role || 'Staff'})
                </span>
              )}
            </div>
            <span className="small text-muted d-flex align-items-center">
              <Clock size={13} className="me-1" />
              {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
            </span>
          </div>
          {item.remarks && (
            <p className="text-secondary small mb-1 bg-light p-2 rounded-2 mt-1 border">
              {item.remarks}
            </p>
          )}
          {item.evidence_url && (
            <div className="mt-1">
              <a
                href={item.evidence_url}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-outline-primary py-0 px-2 small"
              >
                View Evidence Attachment
              </a>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default Timeline
