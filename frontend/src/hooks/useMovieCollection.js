import { useEffect, useState } from 'react'

export function useMovieCollection(fetchMovies, fallbackErrorMessage, limit = 15) {
  const [movies, setMovies] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadMovies() {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const results = await fetchMovies()

        if (isMounted) {
          setMovies(limit ? results.slice(0, limit) : results)
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error ? error.message : fallbackErrorMessage,
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadMovies()

    return () => {
      isMounted = false
    }
  }, [fetchMovies, fallbackErrorMessage, limit])

  return {
    movies,
    isLoading,
    errorMessage,
  }
}
