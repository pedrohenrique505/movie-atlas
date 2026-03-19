import { useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { SearchIcon } from '../components/navigation/SearchIcon'
import { useTypingPlaceholder } from '../hooks/useTypingPlaceholder'

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [isTopbarVisible, setIsTopbarVisible] = useState(true)

  const placeholderExamples = useMemo(
    () => [
      "'The Batman'",
      "'Marty Supreme'",
      "'Christopher Nolan'",
      "'Zendaya'",
      "'Homem Aranha'",
    ],
    [],
  )
  const animatedPlaceholder = useTypingPlaceholder('Buscar por ', placeholderExamples)

  useEffect(() => {
    if (location.pathname === '/search') {
      setQuery(searchParams.get('q') ?? '')
    }
  }, [location.pathname, searchParams])

  useEffect(() => {
    let lastScrollY = window.scrollY
    let ticking = false
    const threshold = 12

    function updateTopbarVisibility() {
      const currentScrollY = window.scrollY
      const delta = currentScrollY - lastScrollY

      if (currentScrollY <= 16) {
        setIsTopbarVisible(true)
      } else if (delta > threshold) {
        setIsTopbarVisible(false)
      } else if (delta < -threshold) {
        setIsTopbarVisible(true)
      }

      lastScrollY = currentScrollY
      ticking = false
    }

    function handleScroll() {
      if (!ticking) {
        window.requestAnimationFrame(updateTopbarVisibility)
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  function handleSearchSubmit(event) {
    event.preventDefault()

    const normalizedQuery = query.trim()
    navigate(normalizedQuery ? `/search?q=${encodeURIComponent(normalizedQuery)}` : '/search')
  }

  return (
    <div className="shell">
      <header
        className={`topbar ${isTopbarVisible ? 'topbar--visible' : 'topbar--hidden'}`.trim()}
      >
        <NavLink className="brand" to="/">
          Movie Atlas
        </NavLink>

        <nav className="topnav" aria-label="Principal">
          <NavLink
            to="/movies"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Filmes
          </NavLink>
          <NavLink
            to="/tv-shows"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Séries
          </NavLink>
          <NavLink
            to="/people"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Pessoas
          </NavLink>
          <NavLink
            to="/upcoming"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Lançamentos
          </NavLink>
        </nav>

        <div className="topbar-tools">
          <form
            className={`search-shell ${isSearchFocused || query ? 'search-shell--expanded' : ''}`.trim()}
            role="search"
            onSubmit={handleSearchSubmit}
          >
            <div className="search-shell__field">
              <span className="search-shell__icon" aria-hidden="true">
                <SearchIcon />
              </span>

              <input
                type="search"
                name="global-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder={animatedPlaceholder}
                aria-label="Buscar"
              />
            </div>

            <button type="submit" aria-label="Buscar">
              <SearchIcon />
            </button>
          </form>
        </div>
      </header>

      <Outlet />
    </div>
  )
}
