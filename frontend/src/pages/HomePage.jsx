import { useEffect, useState } from 'react'

import { HomeFeaturedHero } from '../components/HomeFeaturedHero'
import { MovieGridSection } from '../components/MovieGridSection'
import { MovieTrailer } from '../components/MovieTrailer'
import { PeopleGridSection } from '../components/PeopleGridSection'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useMovieCollection } from '../hooks/useMovieCollection'
import { api } from '../services/api'

export function HomePage() {
  useDocumentTitle('Movie Atlas')
  const [featuredMovie, setFeaturedMovie] = useState(null)
  const [isFeaturedTrailerOpen, setIsFeaturedTrailerOpen] = useState(false)

  const trending = useMovieCollection(
    api.getTrendingMovies,
    'Nao foi possivel carregar os filmes em alta.',
  )
  const trendingPeople = useMovieCollection(
    api.getTrendingPeople,
    'Nao foi possivel carregar as pessoas em alta.',
  )
  const nowPlaying = useMovieCollection(
    api.getNowPlayingMovies,
    'Nao foi possivel carregar os filmes em cartaz.',
  )
  const topRated = useMovieCollection(
    api.getTopRatedMovies,
    'Nao foi possivel carregar os filmes mais bem avaliados.',
  )
  const upcoming = useMovieCollection(
    api.getUpcomingMovies,
    'Nao foi possivel carregar os proximos lancamentos.',
  )

  useEffect(() => {
    let active = true

    async function loadFeaturedMovie() {
      const highlightedMovie = trending.movies[0]

      if (!highlightedMovie) {
        setFeaturedMovie(null)
        return
      }

      try {
        const detailedMovie = await api.getMovieDetails(highlightedMovie.id)

        if (active) {
          setFeaturedMovie(detailedMovie)
        }
      } catch (error) {
        if (active) {
          setFeaturedMovie(highlightedMovie)
        }
      }
    }

    loadFeaturedMovie()

    return () => {
      active = false
    }
  }, [trending.movies])

  useEffect(() => {
    setIsFeaturedTrailerOpen(false)
  }, [featuredMovie?.id])

  return (
    <main className="app-shell">
      {featuredMovie ? (
        <HomeFeaturedHero
          movie={featuredMovie}
          onOpenTrailer={() => setIsFeaturedTrailerOpen(true)}
        />
      ) : (
        <section className="home-intro">
          <h1 className="home-hero__title">
            Descubra filmes em alta, em cartaz e os proximos lancamentos.
          </h1>
          <p className="lead">
            Explore o catalogo com destaques atualizados e acesso rapido aos detalhes de cada
            obra.
          </p>
        </section>
      )}

      <MovieGridSection
        title="Em alta"
        eyebrow="Agora"
        movies={trending.movies}
        isLoading={trending.isLoading}
        errorMessage={trending.errorMessage}
        emptyMessage="Nenhum filme em alta encontrado."
      />

      <PeopleGridSection
        title="Top pessoas em alta"
        eyebrow="Destaques"
        people={trendingPeople.movies}
        isLoading={trendingPeople.isLoading}
        errorMessage={trendingPeople.errorMessage}
        emptyMessage="Nenhuma pessoa em alta encontrada."
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
        title="Filmes mais bem avaliados"
        eyebrow="Avaliacoes"
        movies={topRated.movies}
        isLoading={topRated.isLoading}
        errorMessage={topRated.errorMessage}
        emptyMessage="Nenhum filme bem avaliado encontrado."
      />

      <MovieGridSection
        title="Proximos lancamentos"
        eyebrow="Em breve"
        movies={upcoming.movies}
        isLoading={upcoming.isLoading}
        errorMessage={upcoming.errorMessage}
        emptyMessage="Nenhum proximo lancamento encontrado."
        datePrefix="Data prevista de estreia"
      />

      <MovieTrailer
        trailer={featuredMovie?.trailer}
        isOpen={isFeaturedTrailerOpen}
        onClose={() => setIsFeaturedTrailerOpen(false)}
      />
    </main>
  )
}
