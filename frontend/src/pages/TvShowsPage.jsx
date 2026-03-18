import { MovieListSection } from '../components/MovieListSection'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useMovieCollection } from '../hooks/useMovieCollection'
import { api } from '../services/api'

export function TvShowsPage() {
  useDocumentTitle('Séries | Movie Atlas')

  const shows = useMovieCollection(
    api.getPopularTvShows,
    'Não foi possível carregar as séries populares.',
  )

  return (
    <main className="app-shell">
      <section className="page-heading page-heading--compact">
        <div className="page-copy">
          <h1>Séries populares</h1>
        </div>
      </section>

      <MovieListSection
        movies={shows.movies}
        isLoading={shows.isLoading}
        errorMessage={shows.errorMessage}
        emptyMessage="Nenhuma série encontrada."
        variant="poster"
        gridClassName="movie-grid--five movie-grid--posters"
        ariaLabel="Lista de séries populares"
        buildItemPath={() => null}
      />
    </main>
  )
}
