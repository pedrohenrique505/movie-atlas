import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { SearchIcon } from '../components/navigation/SearchIcon'
import { useTypingPlaceholder } from '../hooks/useTypingPlaceholder'

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [isTopbarVisible, setIsTopbarVisible] = useState(true)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const searchContainerRef = useRef(null)
  const searchInputRef = useRef(null)

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

  useEffect(() => {
    if (!isSearchOpen) {
      return undefined
    }

    function handlePointerDown(event) {
      if (!searchContainerRef.current?.contains(event.target)) {
        setIsSearchOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsSearchOpen(false)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isSearchOpen])

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus()
    }
  }, [isSearchOpen])

  function handleSearchSubmit(event) {
    event.preventDefault()

    const normalizedQuery = query.trim()
    navigate(normalizedQuery ? `/search?q=${encodeURIComponent(normalizedQuery)}` : '/search')
    setIsSearchOpen(false)
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

        <div className="topbar-tools" ref={searchContainerRef}>
          <button
            type="button"
            className={`search-toggle ${isSearchOpen ? 'search-toggle--active' : ''}`.trim()}
            aria-label="Abrir busca"
            aria-expanded={isSearchOpen}
            aria-controls="topbar-search-panel"
            onClick={() => setIsSearchOpen((currentValue) => !currentValue)}
          >
            <SearchIcon />
          </button>

          <div
            id="topbar-search-panel"
            className={`search-popover ${isSearchOpen ? 'search-popover--open' : ''}`.trim()}
            aria-hidden={!isSearchOpen}
          >
            <form className="search-shell" role="search" onSubmit={handleSearchSubmit}>
              <div className="search-shell__field">
                <span className="search-shell__icon" aria-hidden="true">
                  <SearchIcon />
                </span>

                <input
                  ref={searchInputRef}
                  type="search"
                  name="global-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={animatedPlaceholder}
                  aria-label="Buscar"
                />
              </div>

              <button type="submit" aria-label="Buscar">
                <SearchIcon />
              </button>
            </form>
          </div>
        </div>
      </header>

      <Outlet />
    </div>
  )
}
