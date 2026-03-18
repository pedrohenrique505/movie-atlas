import { MovieListSection } from '../components/MovieListSection'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useMovieCollection } from '../hooks/useMovieCollection'
import { api } from '../services/api'

export function MoviesPage() {
  useDocumentTitle('Filmes | Movie Atlas')

  const movies = useMovieCollection(
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
        movies={movies.movies}
        isLoading={movies.isLoading}
        errorMessage={movies.errorMessage}
        emptyMessage="Nenhum filme popular encontrado."
        variant="poster"
        gridClassName="movie-grid--five movie-grid--posters"
        ariaLabel="Lista de filmes populares"
      />
    </main>
  )
}
