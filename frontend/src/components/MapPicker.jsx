import React, { useState, useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import api from '../services/api'
import { Navigation, MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'

// Fix Leaflet marker icon asset paths in Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const LocationMarker = ({ position, setPosition, onLocationChange }) => {
  const map = useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng])
      onLocationChange(e.latlng.lat, e.latlng.lng)
      map.flyTo(e.latlng, map.getZoom())
    },
  })

  return position === null ? null : (
    <Marker
      position={position}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target
          const coords = marker.getLatLng()
          setPosition([coords.lat, coords.lng])
          onLocationChange(coords.lat, coords.lng)
        },
      }}
    />
  )
}

const MapPicker = ({ initialLat = 22.7196, initialLng = 75.8577, onSelectLocation, selectedAddress }) => {
  const { t } = useTranslation()
  const [position, setPosition] = useState([initialLat, initialLng])
  const [locating, setLocating] = useState(false)
  const [geoError, setGeoError] = useState(null)
  const mapRef = useRef(null)

  useEffect(() => {
    if (initialLat && initialLng) {
      setPosition([initialLat, initialLng])
    }
  }, [initialLat, initialLng])

  const handleLocationChange = async (lat, lng) => {
    try {
      const res = await api.get(`/maps/reverse-geocode?lat=${lat}&lon=${lng}`)
      const addr = res.data.address
      const formattedAddress = addr.display_name || `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`
      onSelectLocation({
        latitude: lat,
        longitude: lng,
        address: formattedAddress,
        state: addr.state,
      })
    } catch (err) {
      onSelectLocation({
        latitude: lat,
        longitude: lng,
        address: `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`,
      })
    }
  }

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser')
      return
    }

    setLocating(true)
    setGeoError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setPosition([lat, lng])
        setLocating(false)
        handleLocationChange(lat, lng)
        if (mapRef.current) {
          mapRef.current.flyTo([lat, lng], 16)
        }
      },
      (err) => {
        setLocating(false)
        setGeoError('GPS permission denied or unavailable. Please click on the map to set location manually.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  return (
    <div className="w-100">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <label className="form-label fw-semibold mb-0 small text-muted">
          <MapPin size={15} className="me-1 text-primary" />
          Click or drag marker on map to pinpoint exact location
        </label>
        <button
          type="button"
          className="btn btn-sm btn-outline-primary d-inline-flex align-items-center"
          onClick={handleUseGPS}
          disabled={locating}
        >
          <Navigation size={14} className="me-1" />
          {locating ? t('common.loading') : t('form.useGPS')}
        </button>
      </div>

      {geoError && (
        <div className="alert alert-warning py-1.5 px-3 small mb-2">
          {geoError}
        </div>
      )}

      <div className="map-picker-container shadow-sm mb-2">
        <MapContainer
          center={position}
          zoom={14}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker
            position={position}
            setPosition={setPosition}
            onLocationChange={handleLocationChange}
          />
        </MapContainer>
      </div>

      <div className="bg-light p-2 rounded-2 border small text-muted d-flex justify-content-between align-items-center">
        <span><strong>Coordinates:</strong> {position[0].toFixed(5)}, {position[1].toFixed(5)}</span>
        <span className="text-truncate ms-2" style={{ maxWidth: '60%' }}>
          <strong>Address:</strong> {selectedAddress || 'Click map to identify address'}
        </span>
      </div>
    </div>
  )
}

export default MapPicker
