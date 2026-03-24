import { useEffect, useState } from 'react'

import { CatalogFiltersCard } from '../components/CatalogFiltersCard'
import { LoadMoreSection } from '../components/LoadMoreSection'
import { MovieListSection } from '../components/MovieListSection'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { usePaginatedCollection } from '../hooks/usePaginatedCollection'
import { api } from '../services/api'

const DEFAULT_SORT_BY = 'popularity.desc'

const SORT_OPTIONS = [
  { value: 'original_name.asc', label: 'A-Z' },
  { value: 'original_name.desc', label: 'Z-A' },
  { value: 'popularity.desc', label: 'Popularidade desc' },
  { value: 'popularity.asc', label: 'Popularidade asc' },
  { value: 'vote_average.desc', label: 'Avaliacao desc' },
  { value: 'vote_average.asc', label: 'Avaliacao asc' },
  { value: 'first_air_date.desc', label: 'Lancamento desc' },
  { value: 'first_air_date.asc', label: 'Lancamento asc' },
]

export function TvShowsPage() {
  const [genres, setGenres] = useState([])
  const [selectedGenreId, setSelectedGenreId] = useState('')
  const [selectedSortBy, setSelectedSortBy] = useState(DEFAULT_SORT_BY)
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

  const shouldUseDiscover = selectedGenreId || selectedSortBy !== DEFAULT_SORT_BY

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
          <CatalogFiltersCard
            sortOptions={SORT_OPTIONS}
            selectedSortBy={selectedSortBy}
            onSortChange={setSelectedSortBy}
            genres={genres}
            selectedGenreId={selectedGenreId}
            onGenreChange={setSelectedGenreId}
            isLoadingGenres={isLoadingGenres}
            genreErrorMessage={genreErrorMessage}
          />
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
