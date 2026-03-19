import { useEffect, useState } from 'react'

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return false
    }

    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return undefined
    }

    const mediaQuery = window.matchMedia(query)

    function updateMatch(event) {
      setMatches(event.matches)
    }

    setMatches(mediaQuery.matches)

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateMatch)

      return () => {
        mediaQuery.removeEventListener('change', updateMatch)
      }
    }

    mediaQuery.addListener(updateMatch)

    return () => {
      mediaQuery.removeListener(updateMatch)
    }
  }, [query])

  return matches
}
