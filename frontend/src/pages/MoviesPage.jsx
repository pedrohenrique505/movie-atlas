import { useEffect, useState } from 'react'

import { CatalogFiltersCard } from '../components/CatalogFiltersCard'
import { LoadMoreSection } from '../components/LoadMoreSection'
import { MovieListSection } from '../components/MovieListSection'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { usePaginatedCollection } from '../hooks/usePaginatedCollection'
import { api } from '../services/api'

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Popularidade' },
  { value: 'original_title.asc', label: 'Alfabetica' },
  { value: 'vote_average.desc', label: 'Avaliacao' },
  { value: 'release_date.desc', label: 'Lancamento' },
]

export function MoviesPage() {
  const [genres, setGenres] = useState([])
  const [selectedGenreId, setSelectedGenreId] = useState('')
  const [selectedSortBy, setSelectedSortBy] = useState('popularity.desc')
  const [isLoadingGenres, setIsLoadingGenres] = useState(true)
  const [genreErrorMessage, setGenreErrorMessage] = useState('')

  useDocumentTitle('Filmes | Movie Atlas')

  useEffect(() => {
    let isMounted = true

    async function loadGenres() {
      try {
        setIsLoadingGenres(true)
        setGenreErrorMessage('')

        const payload = await api.getMovieGenres()

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

  const movies = usePaginatedCollection(
    ({ page, paginated }) =>
      selectedGenreId
        ? api.discoverMovies({ page, paginated, genreId: selectedGenreId })
        : api.getPopularMovies({ page, paginated }),
    selectedGenreId
      ? 'Nao foi possivel carregar os filmes do genero selecionado.'
      : 'Nao foi possivel carregar os filmes populares.',
    selectedGenreId || 'popular',
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
            movies={movies.items}
            isLoading={movies.isLoading}
            errorMessage={movies.isLoading ? movies.errorMessage : ''}
            emptyMessage={
              selectedGenreId
                ? 'Nenhum filme encontrado para este genero.'
                : 'Nenhum filme popular encontrado.'
            }
            variant="poster"
            gridClassName="movie-grid--five movie-grid--posters"
            ariaLabel="Lista de filmes"
          />

          <LoadMoreSection
            hasItems={movies.items.length > 0}
            hasNextPage={movies.hasNextPage}
            isLoadingMore={movies.isLoadingMore}
            errorMessage={!movies.isLoading ? movies.errorMessage : ''}
            onLoadMore={movies.loadMore}
          />
        </div>
      </section>
    </main>
  )
}
