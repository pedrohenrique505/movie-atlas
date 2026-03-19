import { HomeTrendingBanner } from '../components/HomeTrendingBanner'
import { MovieGridSection } from '../components/MovieGridSection'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useMovieCollection } from '../hooks/useMovieCollection'
import { api } from '../services/api'

export function HomePage() {
  useDocumentTitle('Movie Atlas')

  const trending = useMovieCollection(
    api.getTrendingMovies,
    'Não foi possível carregar os filmes em alta.',
  )
  const nowPlaying = useMovieCollection(
    api.getNowPlayingMovies,
    'Não foi possível carregar os filmes em cartaz.',
  )
  const upcoming = useMovieCollection(
    api.getUpcomingMovies,
    'Não foi possível carregar os próximos lançamentos.',
  )

  return (
    <main className="app-shell">
      <section className="hero-panel hero-panel--home">
        <div className="hero-copy home-hero__copy">
          <h1 className="home-hero__title">
            Descubra filmes em alta, em cartaz e os próximos lançamentos.
          </h1>
          <p className="lead">
            Explore o catálogo com destaques atualizados e acesso rápido aos detalhes de cada obra.
          </p>
        </div>

        <HomeTrendingBanner
          movies={trending.movies}
          isLoading={trending.isLoading}
          errorMessage={trending.errorMessage}
        />
      </section>

      <MovieGridSection
        title="Em alta"
        eyebrow="Agora"
        movies={trending.movies}
        isLoading={trending.isLoading}
        errorMessage={trending.errorMessage}
        emptyMessage="Nenhum filme em alta encontrado."
      />

      <MovieGridSection
        title="Em cartaz"
        eyebrow="Cinemas"
        movies={nowPlaying.movies}
        isLoading={nowPlaying.isLoading}
        errorMessage={nowPlaying.errorMessage}
        emptyMessage="Nenhum filme em cartaz encontrado."
      />

      <MovieGridSection
        title="Próximos lançamentos"
        eyebrow="Em breve"
        movies={upcoming.movies}
        isLoading={upcoming.isLoading}
        errorMessage={upcoming.errorMessage}
        emptyMessage="Nenhum próximo lançamento encontrado."
        datePrefix="Data prevista de estreia"
      />
    </main>
  )
}
