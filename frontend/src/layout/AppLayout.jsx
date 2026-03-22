import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { useAuth } from '../auth/AuthContext'
import { LoginModal } from '../components/LoginModal'
import { CloseIcon } from '../components/navigation/CloseIcon'
import { ArrowIcon } from '../components/navigation/ArrowIcon'
import { ProfileIcon } from '../components/navigation/ProfileIcon'
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
  const {
    authModalMode,
    authenticated,
    closeAuthModal,
    isAuthModalOpen,
    loadingInitial,
    login,
    logout,
    openAuthModal,
    register,
    sendVerificationEmail,
    setAuthModalMode,
    user,
  } = useAuth()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [isTopbarVisible, setIsTopbarVisible] = useState(true)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false)
  const [isMobileViewport, setIsMobileViewport] = useState(false)
  const [authError, setAuthError] = useState('')
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false)
  const [verificationNotice, setVerificationNotice] = useState('')
  const [verificationError, setVerificationError] = useState('')
  const [isSendingVerification, setIsSendingVerification] = useState(false)
  const searchContainerRef = useRef(null)
  const accountMenuRef = useRef(null)
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
    setIsAccountMenuOpen(false)
    closeAuthModal()
  }, [closeAuthModal, location.pathname])

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      return undefined
    }

    const mediaQuery = window.matchMedia('(max-width: 860px)')

    function updateViewportState(event) {
      setIsMobileViewport(event.matches)
    }

    setIsMobileViewport(mediaQuery.matches)

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', updateViewportState)

      return () => {
        mediaQuery.removeEventListener('change', updateViewportState)
      }
    }

    mediaQuery.addListener(updateViewportState)

    return () => {
      mediaQuery.removeListener(updateViewportState)
    }
  }, [])

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
    if (!isAccountMenuOpen) {
      return undefined
    }

    function handlePointerDown(event) {
      if (!accountMenuRef.current?.contains(event.target)) {
        setIsAccountMenuOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsAccountMenuOpen(false)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isAccountMenuOpen])

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus()
    }
  }, [isSearchOpen])

  useEffect(() => {
    if (authenticated) {
      setAuthError('')
    }
  }, [authenticated])

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

  async function handleAuthSubmit(mode, payload) {
    setAuthError('')
    setVerificationNotice('')
    setVerificationError('')
    setIsSubmittingAuth(true)

    try {
      if (mode === 'register') {
        await register(payload)
      } else {
        await login(payload)
      }
    } catch (error) {
      setAuthError(error.message || 'Nao foi possivel concluir a autenticacao.')
    } finally {
      setIsSubmittingAuth(false)
    }
  }

  async function handleLogout() {
    setVerificationNotice('')
    setVerificationError('')

    try {
      await logout()
    } catch (error) {
      setVerificationError(error.message || 'Nao foi possivel encerrar a sessao agora.')
    }
  }

  async function handleSendVerificationEmail() {
    setVerificationNotice('')
    setVerificationError('')
    setIsSendingVerification(true)

    try {
      const payload = await sendVerificationEmail()
      setVerificationNotice(payload.detail)
    } catch (error) {
      setVerificationError(error.message || 'Nao foi possivel enviar o e-mail agora.')
    } finally {
      setIsSendingVerification(false)
    }
  }

  const accountTriggerLabel = loadingInitial
    ? 'Carregando conta'
    : authenticated
      ? `Conta de ${user.username}`
      : 'Entrar ou criar conta'

  function handleAccountTrigger() {
    if (loadingInitial) {
      return
    }

    if (!authenticated) {
      openAuthModal('login')
      return
    }

    setIsAccountMenuOpen((currentValue) => !currentValue)
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

        <div className="topbar-tools">
          <form
            className={`search-shell ${isSearchOpen ? 'search-shell--expanded' : 'search-shell--collapsed'}`.trim()}
            role="search"
            onSubmit={handleSearchSubmit}
            ref={searchContainerRef}
          >
            {isMobileViewport && isSearchOpen ? (
              <button
                type="button"
                className="search-shell__back"
                aria-label="Voltar"
                onClick={() => setIsSearchOpen(false)}
              >
                <ArrowIcon direction="left" />
              </button>
            ) : null}

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

          <div className="account-tools" ref={accountMenuRef}>
            <button
              type="button"
              className={`account-trigger ${authenticated ? 'account-trigger--active' : ''}`.trim()}
              aria-label={accountTriggerLabel}
              title={accountTriggerLabel}
              aria-expanded={authenticated ? isAccountMenuOpen : undefined}
              aria-haspopup={authenticated ? 'menu' : 'dialog'}
              onClick={handleAccountTrigger}
              disabled={loadingInitial}
            >
              <ProfileIcon />
            </button>

            {authenticated && isAccountMenuOpen ? (
              <div className="account-menu" role="menu" aria-label="Conta">
                <div className="account-chip">
                  <span className="account-chip__label">Conta</span>
                  <strong>{user.username}</strong>
                </div>

                <Link
                  className="button-link"
                  to="/favorites"
                  role="menuitem"
                  onClick={() => setIsAccountMenuOpen(false)}
                >
                  Favoritos
                </Link>
                <button
                  type="button"
                  className="button-link"
                  role="menuitem"
                  onClick={async () => {
                    setIsAccountMenuOpen(false)
                    await handleLogout()
                  }}
                >
                  Sair
                </button>
              </div>
            ) : null}
          </div>
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

          <div className="mobile-nav__account">
            {loadingInitial ? (
              <span className="account-chip account-chip--muted">Conta...</span>
            ) : authenticated ? (
              <>
                <div className="account-chip">
                  <span className="account-chip__label">Conectado</span>
                  <strong>{user.username}</strong>
                </div>
                <Link className="button-link" to="/favorites">
                  Favoritos
                </Link>
                <button type="button" className="button-link" onClick={handleLogout}>
                  Sair
                </button>
              </>
            ) : (
              <button
                type="button"
                className="button-link primary"
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  openAuthModal('login')
                }}
              >
                Entrar
              </button>
            )}
          </div>
        </aside>
      </div>

      {authenticated && !user.is_email_verified ? (
        <section className="account-banner" aria-label="Status da conta">
          <div className="account-banner__content">
            <div>
              <span className="eyebrow">Verificacao pendente</span>
              <p>
                Seu e-mail ainda nao foi verificado. Isso bloqueia a criacao de favoritos.
              </p>
            </div>

            <button
              type="button"
              className="button-link primary"
              onClick={handleSendVerificationEmail}
              disabled={isSendingVerification}
            >
              {isSendingVerification ? 'Enviando...' : 'Reenviar verificacao'}
            </button>
          </div>

          {verificationNotice ? <p className="account-banner__feedback">{verificationNotice}</p> : null}
          {verificationError ? (
            <p className="account-banner__feedback account-banner__feedback--error">
              {verificationError}
            </p>
          ) : null}
        </section>
      ) : null}

      <Outlet />

      <LoginModal
        open={isAuthModalOpen}
        mode={authModalMode}
        onClose={() => {
          if (!isSubmittingAuth) {
            closeAuthModal()
          }
        }}
        onModeChange={(nextMode) => {
          setAuthError('')
          setAuthModalMode(nextMode)
        }}
        onSubmit={handleAuthSubmit}
        loading={isSubmittingAuth}
        errorMessage={authError}
      />
    </div>
  )
}
