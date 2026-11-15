import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
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
      // Clear token if invalid or expired
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('pcms_token')
        localStorage.removeItem('pcms_user')
      }
    }
    return Promise.reject(error)
  }
)

export default api
