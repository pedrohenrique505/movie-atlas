import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { ApiError, api } from '../services/api'

const AuthContext = createContext(null)

function isUnauthorizedError(error) {
  return error instanceof ApiError && (error.status === 401 || error.status === 403)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  useEffect(() => {
    if (globalThis.__MOVIE_ATLAS_DISABLE_AUTH_BOOTSTRAP__) {
      setIsBootstrapping(false)
      return undefined
    }

    let active = true

    async function loadCurrentUser() {
      try {
        const user = await api.getCurrentUser()

        if (active) {
          setCurrentUser(user)
        }
      } catch (error) {
        if (!active) {
          return
        }

        if (isUnauthorizedError(error)) {
          setCurrentUser(null)
          return
        }

        console.error(error)
        setCurrentUser(null)
      } finally {
        if (active) {
          setIsBootstrapping(false)
        }
      }
    }

    loadCurrentUser()

    return () => {
      active = false
    }
  }, [])

  const value = useMemo(
    () => ({
      user: currentUser,
      authenticated: Boolean(currentUser),
      loadingInitial: isBootstrapping,
      async login(credentials) {
        await api.login(credentials)
        const user = await api.getCurrentUser()
        setCurrentUser(user)
        return user
      },
      async logout() {
        await api.logout()
        setCurrentUser(null)
      },
      async refreshUser() {
        try {
          const user = await api.getCurrentUser()
          setCurrentUser(user)
          return user
        } catch (error) {
          if (isUnauthorizedError(error)) {
            setCurrentUser(null)
            return null
          }

          throw error
        }
      },
      async sendVerificationEmail() {
        return api.sendVerificationEmail()
      },
    }),
    [currentUser, isBootstrapping],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de AuthProvider.')
  }

  return context
}
