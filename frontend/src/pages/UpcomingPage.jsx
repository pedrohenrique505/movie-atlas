import { MovieListSection } from '../components/MovieListSection'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useUpcomingMovies } from '../hooks/useUpcomingMovies'

export function UpcomingPage() {
  useDocumentTitle('Próximos lançamentos | Movie Atlas')

  const { movies, isLoading, errorMessage } = useUpcomingMovies()

  return (
    <main className="app-shell">
      <section className="page-heading page-heading--compact">
        <div className="page-copy">
          <h1>Próximos lançamentos</h1>
        </div>
      </section>

      <MovieListSection
        movies={movies}
        isLoading={isLoading}
        errorMessage={errorMessage}
        emptyMessage="Nenhum próximo lançamento encontrado."
        variant="poster"
        gridClassName="movie-grid--five movie-grid--posters"
        ariaLabel="Lista de próximos lançamentos"
        datePrefix="Data prevista de estreia"
      />
    </main>
  )
}
