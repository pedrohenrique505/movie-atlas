import { LoadMoreSection } from '../components/LoadMoreSection'
import { MovieListSection } from '../components/MovieListSection'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { usePaginatedCollection } from '../hooks/usePaginatedCollection'
import { api } from '../services/api'

export function MoviesPage() {
  useDocumentTitle('Filmes | Movie Atlas')

  const movies = usePaginatedCollection(
    api.getPopularMovies,
    'Não foi possível carregar os filmes populares.',
  )

  return (
    <main className="app-shell">
      <section className="page-heading page-heading--compact">
        <div className="page-copy">
          <h1>Filmes populares</h1>
        </div>
      </section>

      <MovieListSection
        movies={movies.items}
        isLoading={movies.isLoading}
        errorMessage={movies.isLoading ? movies.errorMessage : ''}
        emptyMessage="Nenhum filme popular encontrado."
        variant="poster"
        gridClassName="movie-grid--five movie-grid--posters"
        ariaLabel="Lista de filmes populares"
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
