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

  const placeholderExamples = useMemo(
    () => [
      "'The Batman'",
      "'Martin Supreme'",
      "'Christopher Nolan'",
      "'Zendaya'",
    ],
    [],
  )
  const animatedPlaceholder = useTypingPlaceholder('Buscar por ', placeholderExamples)

  useEffect(() => {
    if (location.pathname === '/search') {
      setQuery(searchParams.get('q') ?? '')
    }
  }, [location.pathname, searchParams])

  function handleSearchSubmit(event) {
    event.preventDefault()

    const normalizedQuery = query.trim()
    navigate(normalizedQuery ? `/search?q=${encodeURIComponent(normalizedQuery)}` : '/search')
  }

  return (
    <div className="shell">
      <header className="topbar">
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
