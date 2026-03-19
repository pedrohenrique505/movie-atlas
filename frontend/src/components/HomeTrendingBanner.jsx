import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { CollectionFeedback } from './CollectionFeedback'

export function HomeTrendingBanner({ movies, isLoading, errorMessage }) {
  const featuredMovies = useMemo(() => movies.slice(0, 3), [movies])
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    setActiveIndex(0)
  }, [featuredMovies.length])

  useEffect(() => {
    if (featuredMovies.length <= 1) {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % featuredMovies.length)
    }, 5000)

    return () => window.clearInterval(intervalId)
  }, [featuredMovies.length])

  if (isLoading || errorMessage || !featuredMovies.length) {
    return (
      <CollectionFeedback
        isLoading={isLoading}
        errorMessage={errorMessage}
        emptyMessage="Nenhum destaque disponível no momento."
        loadingLabel="Carregando destaques"
      />
    )
  }

  const activeMovie = featuredMovies[activeIndex]
  const backdropImage = activeMovie.backdrop_image ?? activeMovie.poster_image ?? null
  const heroStyle = backdropImage
    ? {
        backgroundImage: `url(${backdropImage})`,
      }
    : undefined

  return (
    <section className="home-hero-banner" aria-label="Destaques em alta" style={heroStyle}>
      <div className="home-hero-banner__overlay" />

      <div className="home-hero-banner__content">
        {featuredMovies.length > 1 ? (
          <div className="home-hero-banner__dots" aria-label="Navegação dos destaques">
            {featuredMovies.map((movie, index) => (
              <button
                key={movie.id}
                type="button"
                className={`home-hero-banner__dot ${index === activeIndex ? 'active' : ''}`.trim()}
                aria-label={`Mostrar destaque ${index + 1}`}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
        ) : (
          <span aria-hidden="true" />
        )}

        <Link className="button-link primary home-hero-banner__cta" to={`/movie/${activeMovie.id}`}>
          Ver detalhes
        </Link>
      </div>
    </section>
  )
}
