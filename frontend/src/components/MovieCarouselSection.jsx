import { useRef } from 'react'

import { CollectionFeedback } from './CollectionFeedback'
import { MoviePosterCard } from './MoviePosterCard'

export function MovieCarouselSection({
  title,
  eyebrow,
  movies,
  isLoading,
  errorMessage,
  emptyMessage,
  datePrefix,
}) {
  const trackRef = useRef(null)

  function scrollTrack(direction) {
    if (!trackRef.current) {
      return
    }

    const amount = Math.round(trackRef.current.clientWidth * 0.9)
    trackRef.current.scrollBy({
      left: direction * amount,
      behavior: 'smooth',
    })
  }

  return (
    <section className="carousel-section" aria-label={title}>
      <div className="section-head">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>

        <div className="carousel-controls" aria-label={`Navegacao de ${title}`}>
          <button type="button" className="carousel-button" onClick={() => scrollTrack(-1)}>
            Anterior
          </button>
          <button type="button" className="carousel-button" onClick={() => scrollTrack(1)}>
            Proximo
          </button>
        </div>
      </div>

      {isLoading || errorMessage || !movies.length ? (
        <CollectionFeedback
          isLoading={isLoading}
          errorMessage={errorMessage}
          emptyMessage={!movies.length ? emptyMessage : ''}
        />
      ) : null}

      {!isLoading && !errorMessage && movies.length ? (
        <div ref={trackRef} className="carousel-track" role="list" tabIndex={0}>
          {movies.map((movie) => (
            <div key={movie.id} className="carousel-slide" role="listitem">
              <MoviePosterCard movie={movie} datePrefix={datePrefix} />
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}
