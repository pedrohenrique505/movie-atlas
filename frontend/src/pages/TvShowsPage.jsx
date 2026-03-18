import { MovieListSection } from '../components/MovieListSection'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useMovieCollection } from '../hooks/useMovieCollection'
import { api } from '../services/api'

export function TvShowsPage() {
  useDocumentTitle('Series | Movie Atlas')

  const shows = useMovieCollection(
    api.getPopularTvShows,
    'Nao foi possivel carregar as series populares.',
  )

  return (
    <main className="app-shell">
      <section className="page-heading">
        <div className="page-copy">
          <p className="eyebrow">Series</p>
          <h1>Series populares</h1>
          <p className="lead">Conteudo real de series populares vindo da API.</p>
        </div>

        <aside className="page-aside">
          <p>Esta listagem ja esta pronta para evoluir para detalhes de series depois.</p>
        </aside>
      </section>

      <MovieListSection
        movies={shows.movies}
        isLoading={shows.isLoading}
        errorMessage={shows.errorMessage}
        emptyMessage="Nenhuma serie encontrada."
        variant="poster"
        gridClassName="movie-grid--five movie-grid--posters"
        ariaLabel="Lista de series populares"
        buildItemPath={() => null}
      />
    </main>
  )
}
