import axios from 'axios'

// Prefer direct backend URL or proxy fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach Bearer token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pcms_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

// Global response error interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('pcms_token')
        localStorage.removeItem('pcms_user')
      }
    }
    return Promise.reject(error)
  }
)

export default api
