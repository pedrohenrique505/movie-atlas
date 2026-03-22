import { useEffect, useState } from 'react'

import { useAuth } from '../auth/AuthContext'
import { FavoriteToggleButton } from '../components/FavoriteToggleButton'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { MoviePosterCard } from '../components/MoviePosterCard'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { api } from '../services/api'

function buildFavoriteRoute(item) {
  return item.media_type === 'tv' ? `/tv-show/${item.id}` : `/movie/${item.id}`
}

export function FavoritesPage() {
  const { authenticated, favorites, favoritesLoaded, openAuthModal } = useAuth()
  const [favoriteItems, setFavoriteItems] = useState([])
  const [isLoadingItems, setIsLoadingItems] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useDocumentTitle('Meus favoritos | Movie Atlas')

  useEffect(() => {
    let active = true

    async function loadFavoriteItems() {
      if (!authenticated) {
        setFavoriteItems([])
        setErrorMessage('')
        setIsLoadingItems(false)
        return
      }

      if (!favorites.length) {
        setFavoriteItems([])
        setErrorMessage('')
        setIsLoadingItems(false)
        return
      }

      try {
        setIsLoadingItems(true)
        setErrorMessage('')

        const items = await Promise.all(
          favorites.map(async (favorite) => {
            const details =
              favorite.media_type === 'tv'
                ? await api.getTvShowDetails(favorite.tmdb_id)
                : await api.getMovieDetails(favorite.tmdb_id)

            return {
              favorite_id: favorite.id,
              ...favorite,
              ...details,
            }
          }),
        )

        if (active) {
          setFavoriteItems(items)
        }
      } catch (error) {
        if (active) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Nao foi possivel carregar seus favoritos.',
          )
        }
      } finally {
        if (active) {
          setIsLoadingItems(false)
        }
      }
    }

    loadFavoriteItems()

    return () => {
      active = false
    }
  }, [authenticated, favorites])

  return (
    <main className="app-shell favorites-page">
      <section className="page-heading page-heading--compact">
        <div className="page-copy">
          <span className="eyebrow">Conta</span>
          <h1>Meus favoritos</h1>
          <p className="lead">
            Reuna aqui os filmes e as series que voce quer acompanhar com mais facilidade.
          </p>
        </div>
      </section>

      {!authenticated ? (
        <section className="status-panel favorites-empty">
          <p>Entre na sua conta para ver e salvar seus favoritos.</p>
          <button
            type="button"
            className="button-link primary"
            onClick={() => openAuthModal('login')}
          >
            Entrar
          </button>
        </section>
      ) : null}

      {authenticated && (!favoritesLoaded || isLoadingItems) ? (
        <div className="status-panel status-panel--loading">
          <LoadingSpinner label="Carregando favoritos" />
        </div>
      ) : null}

      {authenticated && errorMessage ? (
        <p className="status-panel error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {authenticated && favoritesLoaded && !isLoadingItems && !errorMessage && !favoriteItems.length ? (
        <section className="status-panel favorites-empty">
          <p>Voce ainda nao salvou nenhuma obra nos favoritos.</p>
        </section>
      ) : null}

      {authenticated && favoriteItems.length ? (
        <section className="favorites-grid" aria-label="Lista de favoritos">
          {favoriteItems.map((item) => (
            <article key={`${item.media_type}-${item.favorite_id}`} className="favorites-grid__item">
              <MoviePosterCard
                movie={item}
                to={buildFavoriteRoute(item)}
                datePrefix={item.media_type === 'tv' ? 'Primeira exibicao' : 'Estreia'}
                showFavoriteAction={false}
              />
              <div className="favorites-grid__actions">
                <FavoriteToggleButton
                  tmdbId={item.tmdb_id}
                  mediaType={item.media_type}
                  activeLabel="Remover"
                  inactiveLabel="Salvar nos favoritos"
                />
              </div>
            </article>
          ))}
        </section>
      ) : null}
    </main>
  )
}
