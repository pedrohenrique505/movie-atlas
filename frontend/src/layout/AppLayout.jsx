import { NavLink, Outlet } from 'react-router-dom'

export function AppLayout() {
  function handleSearchSubmit(event) {
    event.preventDefault()
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
            Upcoming
          </NavLink>
        </nav>

        <div className="topbar-tools">
          <div className="filter-row" aria-label="Categorias">
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
              Shows de TV
            </NavLink>
            <NavLink
              to="/people"
              className={({ isActive }) => (isActive ? 'filter-chip active' : 'filter-chip')}
            >
              Pessoas
            </NavLink>
          </div>

          <form className="search-shell" role="search" onSubmit={handleSearchSubmit}>
            <input
              type="search"
              name="global-search"
              placeholder="Buscar filmes, series e nomes"
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
