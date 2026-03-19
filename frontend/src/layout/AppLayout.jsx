import { useEffect, useMemo, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { CloseIcon } from '../components/navigation/CloseIcon'
import { ArrowIcon } from '../components/navigation/ArrowIcon'
import { HamburgerIcon } from '../components/navigation/HamburgerIcon'
import { SearchIcon } from '../components/navigation/SearchIcon'
import { useTypingPlaceholder } from '../hooks/useTypingPlaceholder'

const navigationItems = [
  { to: '/movies', label: 'Filmes' },
  { to: '/tv-shows', label: 'Séries' },
  { to: '/people', label: 'Pessoas' },
  { to: '/upcoming', label: 'Lançamentos' },
]

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [isTopbarVisible, setIsTopbarVisible] = useState(true)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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
    setIsMobileMenuOpen(false)
    setIsSearchOpen(false)
  }, [location.pathname])

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

    if (!isSearchOpen) {
      setIsMobileMenuOpen(false)
      setIsSearchOpen(true)
      return
    }

    const normalizedQuery = query.trim()
    navigate(normalizedQuery ? `/search?q=${encodeURIComponent(normalizedQuery)}` : '/search')
  }

  return (
    <div className="shell">
      <header
        className={`topbar ${isTopbarVisible ? 'topbar--visible' : 'topbar--hidden'} ${isSearchOpen ? 'topbar--search-open' : ''}`.trim()}
      >
        <button
          type="button"
          className="topbar-menu-toggle"
          aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-navigation"
          onClick={() => {
            setIsSearchOpen(false)
            setIsMobileMenuOpen((currentValue) => !currentValue)
          }}
        >
          {isMobileMenuOpen ? <CloseIcon /> : <HamburgerIcon />}
        </button>

        <NavLink className="brand" to="/">
          Movie Atlas
        </NavLink>

        <nav className="topnav" aria-label="Principal">
          {navigationItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="topbar-tools" ref={searchContainerRef}>
          <form
            className={`search-shell ${isSearchOpen ? 'search-shell--expanded' : 'search-shell--collapsed'}`.trim()}
            role="search"
            onSubmit={handleSearchSubmit}
          >
            <button
              type="button"
              className="search-shell__back"
              aria-label="Voltar"
              onClick={() => setIsSearchOpen(false)}
            >
              <ArrowIcon direction="left" />
            </button>

            <div className="search-shell__field" aria-hidden={!isSearchOpen}>
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
                tabIndex={isSearchOpen ? 0 : -1}
              />
            </div>

            <button
              type="submit"
              className="search-shell__submit"
              aria-label={isSearchOpen ? 'Buscar' : 'Abrir busca'}
            >
              <SearchIcon />
            </button>
          </form>
        </div>
      </header>

      <div
        className={`mobile-nav ${isMobileMenuOpen ? 'mobile-nav--open' : ''}`.trim()}
        aria-hidden={!isMobileMenuOpen}
      >
        <button
          type="button"
          className="mobile-nav__backdrop"
          aria-label="Fechar menu"
          onClick={() => setIsMobileMenuOpen(false)}
        />

        <aside id="mobile-navigation" className="mobile-nav__panel" aria-label="Categorias">
          <div className="mobile-nav__header">
            <span className="eyebrow">Navegação</span>
            <button
              type="button"
              className="carousel-button"
              aria-label="Fechar menu"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <CloseIcon />
            </button>
          </div>

          <nav className="mobile-nav__links" aria-label="Principal mobile">
            {navigationItems.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>
      </div>

      <Outlet />
    </div>
  )
}
