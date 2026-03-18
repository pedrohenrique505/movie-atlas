import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const placeholders = ['Buscar filmes', 'Buscar series', 'Buscar pessoas']

  useEffect(() => {
    if (location.pathname === '/search') {
      setQuery(searchParams.get('q') ?? '')
    }
  }, [location.pathname, searchParams])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setPlaceholderIndex((currentIndex) => (currentIndex + 1) % placeholders.length)
    }, 2400)

    return () => window.clearInterval(intervalId)
  }, [placeholders.length])

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
            Series
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
            Lancamentos
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
                <svg viewBox="0 0 24 24" className="search-shell__icon-svg">
                  <circle
                    cx="11"
                    cy="11"
                    r="6.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M16 16L20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>

              <input
                type="search"
                name="global-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder={placeholders[placeholderIndex]}
                aria-label="Buscar"
              />
            </div>

            <button type="submit">Buscar</button>
          </form>
        </div>
      </header>

      <Outlet />
    </div>
  )
}
