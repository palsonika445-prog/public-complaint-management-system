import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'
import i18n from '../i18n/i18n'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('pcms_user')
    return saved ? JSON.parse(saved) : null
  })
  const [token, setToken] = useState(() => localStorage.getItem('pcms_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verifyToken = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me')
          setUser(res.data.user)
          localStorage.setItem('pcms_user', JSON.stringify(res.data.user))
          if (res.data.user.preferred_language) {
            i18n.changeLanguage(res.data.user.preferred_language)
            localStorage.setItem('pcms_language', res.data.user.preferred_language)
          }
        } catch (err) {
          logout()
        }
      }
      setLoading(false)
    }
    verifyToken()
  }, [token])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { access_token, user } = res.data
    localStorage.setItem('pcms_token', access_token)
    localStorage.setItem('pcms_user', JSON.stringify(user))
    setToken(access_token)
    setUser(user)
    if (user.preferred_language) {
      i18n.changeLanguage(user.preferred_language)
      localStorage.setItem('pcms_language', user.preferred_language)
    }
    return user
  }

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData)
    const { access_token, user } = res.data
    localStorage.setItem('pcms_token', access_token)
    localStorage.setItem('pcms_user', JSON.stringify(user))
    setToken(access_token)
    setUser(user)
    return user
  }

  const logout = () => {
    localStorage.removeItem('pcms_token')
    localStorage.removeItem('pcms_user')
    setToken(null)
    setUser(null)
  }

  const updateProfile = async (data) => {
    const res = await api.put('/auth/profile', data)
    setUser(res.data.user)
    localStorage.setItem('pcms_user', JSON.stringify(res.data.user))
    return res.data.user
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
