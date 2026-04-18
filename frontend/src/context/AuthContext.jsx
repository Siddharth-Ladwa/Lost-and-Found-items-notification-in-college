import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('lf_user')
    const token  = localStorage.getItem('lf_token')
    if (stored && token) {
      setUser(JSON.parse(stored))
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
    setLoading(false)
  }, [])

  const login = (userData, token) => {
    localStorage.setItem('lf_user',  JSON.stringify(userData))
    localStorage.setItem('lf_token', token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('lf_user')
    localStorage.removeItem('lf_token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData }
    localStorage.setItem('lf_user', JSON.stringify(newUser))
    setUser(newUser)
  }

  const isAdmin = () => user?.role === 'ADMIN'

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
