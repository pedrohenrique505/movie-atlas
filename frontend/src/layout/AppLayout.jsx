import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')

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
          <form className="search-shell" role="search" onSubmit={handleSearchSubmit}>
            <input
              type="search"
              name="global-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar titulos"
              aria-label="Buscar"
            />
            <button type="submit">Buscar</button>
          </form>
        </div>
      </header>

      <Outlet />
    </div>
  )
}
