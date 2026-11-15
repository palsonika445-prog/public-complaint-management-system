import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import PriorityBadge from './PriorityBadge'
import { ThumbsUp } from 'lucide-react'

// Custom colored SVG pin markers
const createCustomIcon = (status, priority) => {
  let color = '#0284c7' // Blue default
  if (status === 'resolved') color = '#10b981' // Green
  else if (status === 'in_progress') color = '#f59e0b' // Amber
  else if (priority === 'critical') color = '#ef4444' // Red

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32" stroke="#ffffff" stroke-width="1.5"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>`
  
  return L.divIcon({
    html: svg,
    className: 'custom-leaflet-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

// Map center adjuster
const RecenterMap = ({ center }) => {
  const map = useMap()
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, map.getZoom())
    }
  }, [center, map])
  return null
}

const PublicMap = ({ pins = [], center = [22.7196, 75.8577], zoom = 12 }) => {
  return (
    <div className="map-feed-container shadow-sm">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap center={center} />

        {pins.map((pin) => (
          <Marker
            key={pin.id}
            position={[pin.latitude, pin.longitude]}
            icon={createCustomIcon(pin.status, pin.priority)}
          >
            <Popup className="civic-map-popup">
              <div style={{ minWidth: '220px' }}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small text-muted fw-bold">{pin.complaint_number}</span>
                  <StatusBadge status={pin.status} />
                </div>
                <h6 className="fw-bold mb-1 text-dark">{pin.title}</h6>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="badge bg-light text-secondary border small">{pin.category_name}</span>
                  <PriorityBadge priority={pin.priority} />
                </div>
                {pin.landmark && (
                  <p className="small text-muted mb-2">📍 {pin.landmark}</p>
                )}
                <div className="d-flex justify-content-between align-items-center pt-2 border-top">
                  <span className="small text-muted d-flex align-items-center">
                    <ThumbsUp size={13} className="me-1 text-primary" />
                    {pin.support_count || 0} supporters
                  </span>
                  <Link
                    to={`/complaints/${pin.id}`}
                    className="btn btn-xs btn-primary py-0 px-2 small text-decoration-none"
                  >
                    Details &rarr;
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default PublicMap
