import { useEffect, useState } from 'react'

import { CatalogFiltersCard } from '../components/CatalogFiltersCard'
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
            emptyMessage="Nenhuma série encontrada."
            variant="poster"
            gridClassName="movie-grid--five movie-grid--posters"
            ariaLabel="Lista de séries"
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
