import { MovieListSection } from '../components/MovieListSection'
import { useMovieCollection } from '../hooks/useMovieCollection'
import { api } from '../services/api'

export function TvShowsPage() {
  const shows = useMovieCollection(
    api.getPopularTvShows,
    'Nao foi possivel carregar os shows de TV populares.',
  )

  return (
    <main className="app-shell">
      <section className="page-heading">
        <div className="page-copy">
          <p className="eyebrow">Shows de TV</p>
          <h1>Shows de TV populares</h1>
          <p className="lead">Conteudo real de series e programas populares vindo da API.</p>
        </div>

        <aside className="page-aside">
          <p>Esta listagem ja esta pronta para evoluir para detalhes de TV depois.</p>
        </aside>
      </section>

      <MovieListSection
        movies={shows.movies}
        isLoading={shows.isLoading}
        errorMessage={shows.errorMessage}
        emptyMessage="Nenhum show de TV encontrado."
        variant="poster"
        gridClassName="movie-grid--five movie-grid--posters"
        ariaLabel="Lista de shows de TV populares"
        buildItemPath={() => null}
      />
    </main>
  )
}
