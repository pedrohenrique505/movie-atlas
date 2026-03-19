import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { CollectionFeedback } from './CollectionFeedback'
import { formatDateBR } from '../utils/date'

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
    }, 4500)

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

  return (
    <section className="home-banner" aria-label="Destaques em alta">
      <div className="home-banner__copy">
        <p className="eyebrow">Em alta</p>
        <h2>{activeMovie.title}</h2>
        <p className="lead">{activeMovie.synopsis}</p>
        <p className="home-banner__date">
          Estreia: {formatDateBR(activeMovie.release_date) || 'Data indisponível'}
        </p>
        <div className="cta-row">
          <Link className="button-link primary" to={`/movie/${activeMovie.id}`}>
            Ver detalhes
          </Link>
        </div>
      </div>

      <div className="home-banner__media">
        {activeMovie.poster_image ? (
          <img src={activeMovie.poster_image} alt={`Poster de ${activeMovie.title}`} />
        ) : (
          <div className="home-banner__fallback" aria-hidden="true">
            <span>{activeMovie.title.slice(0, 2).toUpperCase()}</span>
          </div>
        )}
      </div>

      {featuredMovies.length > 1 ? (
        <div className="home-banner__dots" aria-label="Navegação dos destaques">
          {featuredMovies.map((movie, index) => (
            <button
              key={movie.id}
              type="button"
              className={`home-banner__dot ${index === activeIndex ? 'active' : ''}`.trim()}
              aria-label={`Mostrar destaque ${index + 1}`}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
