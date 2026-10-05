import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { AuthContext } from './auth-context'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const expireSession = () => setUser(null)
    window.addEventListener('auth:expired', expireSession)
    api.me()
      .then(({ user: currentUser }) => {
        if (active) setUser(currentUser)
      })
      .catch(() => {
        if (active) setUser(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
      window.removeEventListener('auth:expired', expireSession)
    }
  }, [])

  async function login(credentials) {
    await api.login(credentials)
    const result = await api.me()
    setUser(result.user)
  }

  async function register(data) {
    await api.register(data)
    await login({ email: data.email, password: data.password })
  }

  async function updateProfile(data) {
    const result = await api.updateProfile(data)
    setUser(result.user)
    return result.user
  }

  async function logout() {
    try {
      await api.logout()
    } finally {
      setUser(null)
    }
  }

  return <AuthContext.Provider value={{ user, loading, login, register, updateProfile, logout }}>{children}</AuthContext.Provider>
}
