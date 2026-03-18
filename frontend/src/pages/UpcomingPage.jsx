import { MovieListSection } from '../components/MovieListSection'
import { useUpcomingMovies } from '../hooks/useUpcomingMovies'

export function UpcomingPage() {
  const { movies, isLoading, errorMessage } = useUpcomingMovies()

  return (
    <main className="app-shell">
      <section className="page-heading">
        <div className="page-copy">
          <p className="eyebrow">Upcoming</p>
          <h1>Proximos lancamentos</h1>
          <p className="lead">
            Dados vindos do backend em <code>/api/movies/upcoming</code>.
          </p>
        </div>

        <aside className="page-aside">
          <p>Listagem limpa, ampla e preparada para crescer com filtros e carrosseis.</p>
        </aside>
      </section>

      <MovieListSection
        movies={movies}
        isLoading={isLoading}
        errorMessage={errorMessage}
        emptyMessage="Nenhum proximo lancamento encontrado."
        variant="poster"
        gridClassName="movie-grid--five movie-grid--posters"
        ariaLabel="Lista de proximos lancamentos"
        datePrefix="Data prevista de estreia"
      />
    </main>
  )
}
