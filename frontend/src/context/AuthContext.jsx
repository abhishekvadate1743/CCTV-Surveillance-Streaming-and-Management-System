import React, { createContext, useState, useEffect } from 'react'
import axios from 'axios'
import Cookies from 'js-cookie'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const API_URL = 'http://localhost:5000/api'

  // Check if user is already logged in
  useEffect(() => {
    const token = Cookies.get('token')
    if (token) {
      verifyToken(token)
    } else {
      setLoading(false)
    }
  }, [])

  const verifyToken = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUser(response.data.user)
    } catch (err) {
      Cookies.remove('token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      setError(null)
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      })
      const { token, user } = response.data
      Cookies.set('token', token, { expires: 7 })
      setUser(user)
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Login failed'
      setError(message)
      return { success: false, error: message }
    }
  }

  const register = async (name, email, password, role = 'viewer') => {
    try {
      setError(null)
      const response = await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
        role
      })
      const { token, user } = response.data
      Cookies.set('token', token, { expires: 7 })
      setUser(user)
      return { success: true }
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Registration failed'
      setError(message)
      return { success: false, error: message }
    }
  }

  const logout = () => {
    Cookies.remove('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
