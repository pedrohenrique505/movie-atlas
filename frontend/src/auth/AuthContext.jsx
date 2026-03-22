import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

import { ApiError, api } from '../services/api'

const AuthContext = createContext(null)

function isUnauthorizedError(error) {
  return error instanceof ApiError && (error.status === 401 || error.status === 403)
}

function buildFavoriteKey(tmdbId, mediaType) {
  return `${mediaType}:${tmdbId}`
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [favoritesLoaded, setFavoritesLoaded] = useState(false)
  const [isBootstrapping, setIsBootstrapping] = useState(true)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [authModalMode, setAuthModalMode] = useState('login')
  const skipNextFavoritesLoadRef = useRef(false)

  const openAuthModal = useCallback((mode = 'login') => {
    setAuthModalMode(mode)
    setIsAuthModalOpen(true)
  }, [])

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false)
  }, [])

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

  useEffect(() => {
    let active = true

    async function loadFavoritesForUser() {
      if (!currentUser) {
        setFavorites([])
        setFavoritesLoaded(false)
        return
      }

      if (skipNextFavoritesLoadRef.current) {
        skipNextFavoritesLoadRef.current = false
        return
      }

      try {
        const payload = await api.getFavorites()

        if (active) {
          setFavorites(payload)
          setFavoritesLoaded(true)
        }
      } catch (error) {
        if (!active) {
          return
        }

        if (isUnauthorizedError(error)) {
          setFavorites([])
          setFavoritesLoaded(false)
          return
        }

        console.error(error)
        setFavoritesLoaded(false)
      }
    }

    loadFavoritesForUser()

    return () => {
      active = false
    }
  }, [currentUser])

  const favoriteMap = useMemo(() => {
    return new Map(
      favorites.map((favorite) => [
        buildFavoriteKey(favorite.tmdb_id, favorite.media_type),
        favorite,
      ]),
    )
  }, [favorites])

  const getFavoriteByContent = useCallback(
    (tmdbId, mediaType) => favoriteMap.get(buildFavoriteKey(tmdbId, mediaType)) ?? null,
    [favoriteMap],
  )

  const isFavorite = useCallback(
    (tmdbId, mediaType) => favoriteMap.has(buildFavoriteKey(tmdbId, mediaType)),
    [favoriteMap],
  )

  const value = useMemo(
    () => ({
      user: currentUser,
      favorites,
      favoritesLoaded,
      authenticated: Boolean(currentUser),
      loadingInitial: isBootstrapping,
      isAuthModalOpen,
      authModalMode,
      openAuthModal,
      closeAuthModal,
      setAuthModalMode,
      getFavoriteByContent,
      isFavorite,
      async login(credentials) {
        await api.login(credentials)
        const user = await api.getCurrentUser()
        const userFavorites = await api.getFavorites()

        skipNextFavoritesLoadRef.current = true
        setCurrentUser(user)
        setFavorites(userFavorites)
        setFavoritesLoaded(true)
        setIsAuthModalOpen(false)

        return user
      },
      async register(payload) {
        await api.register(payload)
        await api.login({
          username: payload.username,
          password: payload.password,
        })
        const user = await api.getCurrentUser()
        const userFavorites = await api.getFavorites()

        skipNextFavoritesLoadRef.current = true
        setCurrentUser(user)
        setFavorites(userFavorites)
        setFavoritesLoaded(true)
        setIsAuthModalOpen(false)

        return user
      },
      async logout() {
        await api.logout()
        setCurrentUser(null)
        setFavorites([])
        setFavoritesLoaded(false)
      },
      async refreshUser() {
        try {
          const user = await api.getCurrentUser()
          setCurrentUser(user)
          return user
        } catch (error) {
          if (isUnauthorizedError(error)) {
            setCurrentUser(null)
            setFavorites([])
            setFavoritesLoaded(false)
            return null
          }

          throw error
        }
      },
      async refreshFavorites() {
        if (!currentUser) {
          setFavorites([])
          setFavoritesLoaded(false)
          return []
        }

        const userFavorites = await api.getFavorites()
        setFavorites(userFavorites)
        setFavoritesLoaded(true)
        return userFavorites
      },
      async toggleFavorite({ tmdbId, mediaType }) {
        if (!currentUser) {
          throw new Error('Entre para salvar favoritos.')
        }

        if (!currentUser.is_email_verified) {
          throw new Error('Verifique seu e-mail antes de favoritar.')
        }

        const existingFavorite = favoriteMap.get(buildFavoriteKey(tmdbId, mediaType))

        if (existingFavorite) {
          await api.deleteFavorite(existingFavorite.id)
          setFavorites((currentFavorites) =>
            currentFavorites.filter((favorite) => favorite.id !== existingFavorite.id),
          )
          return { active: false, favoriteId: null }
        }

        const createdFavorite = await api.createFavorite({
          tmdb_id: tmdbId,
          media_type: mediaType,
        })

        setFavorites((currentFavorites) => [createdFavorite, ...currentFavorites])
        return { active: true, favoriteId: createdFavorite.id }
      },
      async sendVerificationEmail() {
        return api.sendVerificationEmail()
      },
    }),
    [
      authModalMode,
      closeAuthModal,
      currentUser,
      favorites,
      favoritesLoaded,
      getFavoriteByContent,
      isFavorite,
      isAuthModalOpen,
      isBootstrapping,
      openAuthModal,
    ],
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
