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
            to="/upcoming"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Lancamentos
          </NavLink>
        </nav>

        <div className="topbar-tools">
          <div className="filter-row" aria-label="Explorar">
            <NavLink
              to="/movies"
              className={({ isActive }) => (isActive ? 'filter-chip active' : 'filter-chip')}
            >
              Filmes
            </NavLink>
            <NavLink
              to="/tv-shows"
              className={({ isActive }) => (isActive ? 'filter-chip active' : 'filter-chip')}
            >
              Series
            </NavLink>
            <NavLink
              to="/actors"
              className={({ isActive }) => (isActive ? 'filter-chip active' : 'filter-chip')}
            >
              Atores
            </NavLink>
            <NavLink
              to="/directors"
              className={({ isActive }) => (isActive ? 'filter-chip active' : 'filter-chip')}
            >
              Diretores
            </NavLink>
          </div>

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
