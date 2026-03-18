import { MovieListSection } from '../components/MovieListSection'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useMovieCollection } from '../hooks/useMovieCollection'
import { api } from '../services/api'

export function MoviesPage() {
  useDocumentTitle('Filmes | Movie Atlas')

  const movies = useMovieCollection(
    api.getPopularMovies,
    'Nao foi possivel carregar os filmes populares.',
  )

  return (
    <main className="app-shell">
      <section className="page-heading">
        <div className="page-copy">
          <p className="eyebrow">Filmes</p>
          <h1>Filmes populares</h1>
          <p className="lead">Selecao real de filmes populares vinda da API e pronta para navegacao.</p>
        </div>

        <aside className="page-aside">
          <p>Os cards levam para a pagina de detalhes do filme.</p>
        </aside>
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
