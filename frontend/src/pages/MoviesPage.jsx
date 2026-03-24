import { useEffect, useState } from 'react'

import { LoadMoreSection } from '../components/LoadMoreSection'
import { MovieListSection } from '../components/MovieListSection'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { usePaginatedCollection } from '../hooks/usePaginatedCollection'
import { api } from '../services/api'

export function MoviesPage() {
  const [genres, setGenres] = useState([])
  const [selectedGenreId, setSelectedGenreId] = useState('')
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
      <section className="page-heading page-heading--compact">
        <div className="page-copy">
          <h1>{selectedGenreId ? 'Filmes por genero' : 'Filmes populares'}</h1>
        </div>
      </section>

      <section className="movie-filters" aria-label="Filtros de genero dos filmes">
        <div className="movie-filters__scroller" role="list">
          <button
            type="button"
            className={`filter-chip movie-filters__pill ${selectedGenreId ? '' : 'movie-filters__pill--selected'}`.trim()}
            onClick={() => setSelectedGenreId('')}
            aria-pressed={!selectedGenreId}
          >
            Todos
          </button>

          {genres.map((genre) => (
            <button
              key={genre.id}
              type="button"
              className={`filter-chip movie-filters__pill ${selectedGenreId === genre.id ? 'movie-filters__pill--selected' : ''}`.trim()}
              onClick={() => setSelectedGenreId(genre.id)}
              aria-pressed={selectedGenreId === genre.id}
            >
              {genre.name}
            </button>
          ))}
        </div>

        {isLoadingGenres ? <p className="movie-filters__status">Carregando generos...</p> : null}
        {genreErrorMessage ? (
          <p className="movie-filters__status error" role="alert">
            {genreErrorMessage}
          </p>
        ) : null}
      </section>

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
        ariaLabel={selectedGenreId ? 'Lista de filmes filtrados por genero' : 'Lista de filmes populares'}
      />

      <LoadMoreSection
        hasItems={movies.items.length > 0}
        hasNextPage={movies.hasNextPage}
        isLoadingMore={movies.isLoadingMore}
        errorMessage={!movies.isLoading ? movies.errorMessage : ''}
        onLoadMore={movies.loadMore}
      />
    </main>
  )
}
