import { useEffect, useState } from 'react'

import { LoadMoreSection } from '../components/LoadMoreSection'
import { MovieListSection } from '../components/MovieListSection'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { usePaginatedCollection } from '../hooks/usePaginatedCollection'
import { api } from '../services/api'

const DEFAULT_SORT_BY = 'popularity.desc'

const SORT_OPTIONS = [
  { value: 'original_name.asc', label: 'Alfabética: A → Z' },
  { value: 'original_name.desc', label: 'Alfabética: Z → A' },
  { value: 'popularity.desc', label: 'Popularidade: maior → menor' },
  { value: 'popularity.asc', label: 'Popularidade: menor → maior' },
  { value: 'vote_average.desc', label: 'Avaliação: maior → menor' },
  { value: 'vote_average.asc', label: 'Avaliação: menor → maior' },
  { value: 'first_air_date.desc', label: 'Lançamento: mais recente → mais antigo' },
  { value: 'first_air_date.asc', label: 'Lançamento: mais antigo → mais recente' },
]

export function TvShowsPage() {
  const [genres, setGenres] = useState([])
  const [selectedGenreId, setSelectedGenreId] = useState('')
  const [selectedSortBy, setSelectedSortBy] = useState(DEFAULT_SORT_BY)
  const [isLoadingGenres, setIsLoadingGenres] = useState(true)
  const [genreErrorMessage, setGenreErrorMessage] = useState('')

  useDocumentTitle('Séries | Movie Atlas')

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
            error instanceof Error ? error.message : 'Não foi possível carregar os gêneros.',
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

  const shouldUseDiscover = selectedGenreId || selectedSortBy !== DEFAULT_SORT_BY
  const selectedSortOption = SORT_OPTIONS.find((option) => option.value === selectedSortBy)
  const selectedGenre = genres.find((genre) => genre.id === selectedGenreId)

  function clearFilters() {
    setSelectedSortBy(DEFAULT_SORT_BY)
    setSelectedGenreId('')
  }

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
      ? 'Não foi possível carregar as séries com os filtros selecionados.'
      : 'Não foi possível carregar as séries populares.',
    `${selectedGenreId || 'all'}:${selectedSortBy}`,
  )

  return (
    <main className="app-shell">
      <section className="catalog-layout">
        <aside className="catalog-sidebar">
          <div className="catalog-filter-card">
            <div className="catalog-filter-card__header">
              <h2>Filtros</h2>
              {shouldUseDiscover ? (
                <button type="button" className="button-link catalog-filter-reset" onClick={clearFilters}>
                  Limpar filtros
                </button>
              ) : null}
            </div>

            <div className="catalog-filter-card__section">
              <p className="eyebrow">Ordenação</p>
              <label className="catalog-filter-field">
                <span className="catalog-filter-field__label">Ordenar por</span>
                <span className="catalog-filter-field__hint">
                  Escolha como as séries devem aparecer na lista.
                </span>
                <select
                  className="catalog-filter-select"
                  value={selectedSortBy}
                  onChange={(event) => setSelectedSortBy(event.target.value)}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="catalog-filter-card__section">
              <p className="eyebrow">Gêneros</p>
              <label className="catalog-filter-field">
                <span className="catalog-filter-field__label">Filtrar por gênero</span>
                <span className="catalog-filter-field__hint">
                  Mostre apenas séries do gênero selecionado.
                </span>
                <select
                  className="catalog-filter-select"
                  value={selectedGenreId}
                  onChange={(event) => setSelectedGenreId(event.target.value)}
                >
                  <option value="">Todos os gêneros</option>
                  {genres.map((genre) => (
                    <option key={genre.id} value={genre.id}>
                      {genre.name}
                    </option>
                  ))}
                </select>
              </label>

              {isLoadingGenres ? <p className="catalog-filter-status">Carregando gêneros...</p> : null}
              {genreErrorMessage ? (
                <p className="catalog-filter-status error" role="alert">
                  {genreErrorMessage}
                </p>
              ) : null}
            </div>

            <div className="catalog-filter-card__section">
              <p className="eyebrow">Aplicado</p>
              <p className="catalog-filter-summary">
                Ordenação: {selectedSortOption?.label ?? 'Popularidade: maior → menor'}
              </p>
              <p className="catalog-filter-summary">
                Gênero: {selectedGenre?.name ?? 'Todos os gêneros'}
              </p>
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
