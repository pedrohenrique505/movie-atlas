import { MovieCarouselSection } from '../components/MovieCarouselSection'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useMovieCollection } from '../hooks/useMovieCollection'
import { api } from '../services/api'

export function HomePage() {
  useDocumentTitle('Movie Atlas')

  const trending = useMovieCollection(
    api.getTrendingMovies,
    'Nao foi possivel carregar os filmes em alta.',
  )
  const nowPlaying = useMovieCollection(
    api.getNowPlayingMovies,
    'Nao foi possivel carregar os filmes em cartaz.',
  )
  const upcoming = useMovieCollection(
    api.getUpcomingMovies,
    'Nao foi possivel carregar os proximos lancamentos.',
  )

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div className="hero-copy">
          <p className="eyebrow">Movie Atlas</p>
          <h1>Descubra filmes em alta, em cartaz e os proximos lancamentos.</h1>
          <p className="lead">
            A Home definitiva organiza o catalogo em trilhas horizontais com
            navegacao simples, foco no poster e acesso rapido aos detalhes.
          </p>
        </div>

        <aside className="hero-aside">
          <p>Tres listas independentes, cada uma com ate 15 filmes.</p>
          <p>Scroll horizontal com controles simples e layout alinhado a nova identidade visual.</p>
        </aside>
      </section>

      <MovieCarouselSection
        title="Em alta"
        eyebrow="Agora"
        movies={trending.movies}
        isLoading={trending.isLoading}
        errorMessage={trending.errorMessage}
        emptyMessage="Nenhum filme em alta encontrado."
      />

      <MovieCarouselSection
        title="Em cartaz"
        eyebrow="Cinemas"
        movies={nowPlaying.movies}
        isLoading={nowPlaying.isLoading}
        errorMessage={nowPlaying.errorMessage}
        emptyMessage="Nenhum filme em cartaz encontrado."
      />

      <MovieCarouselSection
        title="Proximos lancamentos"
        eyebrow="Em breve"
        movies={upcoming.movies}
        isLoading={upcoming.isLoading}
        errorMessage={upcoming.errorMessage}
        emptyMessage="Nenhum proximo lancamento encontrado."
        datePrefix="Data prevista de estreia"
      />
    </main>
  )
}
