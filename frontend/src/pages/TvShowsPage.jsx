import { useEffect, useState } from 'react'

import { LoadMoreSection } from '../components/LoadMoreSection'
import { MovieListSection } from '../components/MovieListSection'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { usePaginatedCollection } from '../hooks/usePaginatedCollection'
import { api } from '../services/api'

const SORT_OPTIONS = [
  { value: 'title.asc', label: 'Alfabetica' },
  { value: 'popularity.desc', label: 'Popularidade' },
  { value: 'vote_average.desc', label: 'Avaliacao' },
  { value: 'first_air_date.desc', label: 'Lancamento' },
]

export function TvShowsPage() {
  const [genres, setGenres] = useState([])
  const [selectedGenreId, setSelectedGenreId] = useState('')
  const [selectedSortBy, setSelectedSortBy] = useState('popularity.desc')
  const [isLoadingGenres, setIsLoadingGenres] = useState(true)
  const [genreErrorMessage, setGenreErrorMessage] = useState('')

  useDocumentTitle('Series | Movie Atlas')

  useEffect(() => {
    let isMounted = true

    async function loadGenres() {
      try {
        setIsLoadingGenres(true)
        setGenreErrorMessage('')

        const payload = await api.getTvGenres()

        if (isMounted) {
          setGenres(payload)
        }
      } catch (error) {
        if (isMounted) {
          setGenreErrorMessage(
            error instanceof Error ? error.message : 'Nao foi possivel carregar os generos.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoadingGenres(false)
        }
      }
    }

    loadGenres()

    return () => {
      isMounted = false
    }
  }, [])

  const shouldUseDiscover = selectedGenreId || selectedSortBy !== 'popularity.desc'

  const shows = usePaginatedCollection(
    ({ page, paginated }) =>
      shouldUseDiscover
        ? api.discoverTvShows({
            page,
            paginated,
            genreId: selectedGenreId,
            sortBy: selectedSortBy,
          })
        : api.getPopularTvShows({ page, paginated }),
    shouldUseDiscover
      ? 'Nao foi possivel carregar as series com os filtros selecionados.'
      : 'Nao foi possivel carregar as series populares.',
    `${selectedGenreId || 'all'}:${selectedSortBy}`,
  )

  return (
    <main className="app-shell">
      <section className="catalog-layout">
        <aside className="catalog-sidebar">
          <div className="catalog-filter-card">
            <div className="catalog-filter-card__section">
              <p className="eyebrow">Ordenar por</p>
              <div className="catalog-filter-list">
                {SORT_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`filter-chip catalog-filter-pill ${selectedSortBy === option.value ? 'catalog-filter-pill--selected' : ''}`.trim()}
                    onClick={() => setSelectedSortBy(option.value)}
                    aria-pressed={selectedSortBy === option.value}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="catalog-filter-card__section">
              <p className="eyebrow">Generos</p>
              <div className="catalog-filter-list">
                <button
                  type="button"
                  className={`filter-chip catalog-filter-pill ${selectedGenreId ? '' : 'catalog-filter-pill--selected'}`.trim()}
                  onClick={() => setSelectedGenreId('')}
                  aria-pressed={!selectedGenreId}
                >
                  Todos
                </button>

                {genres.map((genre) => (
                  <button
                    key={genre.id}
                    type="button"
                    className={`filter-chip catalog-filter-pill ${selectedGenreId === genre.id ? 'catalog-filter-pill--selected' : ''}`.trim()}
                    onClick={() => setSelectedGenreId(genre.id)}
                    aria-pressed={selectedGenreId === genre.id}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>

              {isLoadingGenres ? <p className="catalog-filter-status">Carregando generos...</p> : null}
              {genreErrorMessage ? (
                <p className="catalog-filter-status error" role="alert">
                  {genreErrorMessage}
                </p>
              ) : null}
            </div>
          </div>
        </aside>

        <div className="catalog-results">
          <MovieListSection
            movies={shows.items}
            isLoading={shows.isLoading}
            errorMessage={shows.isLoading ? shows.errorMessage : ''}
            emptyMessage="Nenhuma serie encontrada."
            variant="poster"
            gridClassName="movie-grid--five movie-grid--posters"
            ariaLabel="Lista de series"
            buildItemPath={(show) => `/tv-show/${show.id}`}
          />

          <LoadMoreSection
            hasItems={shows.items.length > 0}
            hasNextPage={shows.hasNextPage}
            isLoadingMore={shows.isLoadingMore}
            errorMessage={!shows.isLoading ? shows.errorMessage : ''}
            onLoadMore={shows.loadMore}
          />
        </div>
      </section>
    </main>
  )
}
