import { Link } from 'react-router-dom'

const RATING_CIRCUMFERENCE = 100

function normalizeRating(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null
  }

  return Math.min(Math.max(value, 0), 10)
}

function getRatingTone(value) {
  if (value > 7) {
    return 'success'
  }

  if (value >= 5) {
    return 'warning'
  }

  return 'danger'
}

export function HomeFeaturedHero({ movie, onOpenTrailer }) {
  const heroStyle = movie?.backdrop_image
    ? { backgroundImage: `url(${movie.backdrop_image})` }
    : undefined
  const rating = normalizeRating(movie?.vote_average)
  const ratingTone = rating === null ? null : getRatingTone(rating)
  const ratingOffset =
    rating === null ? null : RATING_CIRCUMFERENCE - (rating / 10) * RATING_CIRCUMFERENCE

  return (
    <section className="home-featured" style={heroStyle}>
      <div className="home-featured__overlay" />

      <div className="home-featured__content">
        <span className="eyebrow">Filme em destaque</span>
        <h1 className="home-hero__title">{movie?.title ?? 'Movie Atlas'}</h1>

        {movie?.synopsis ? <p className="home-featured__synopsis">{movie.synopsis}</p> : null}

        {rating !== null ? (
          <div className={`details-rating details-rating--${ratingTone}`.trim()}>
            <div className="details-rating__badge" aria-label={`Nota ${rating.toFixed(1)}`}>
              <svg className="details-rating__ring" viewBox="0 0 40 40" aria-hidden="true">
                <circle className="details-rating__track" cx="20" cy="20" r="16" />
                <circle
                  className="details-rating__progress"
                  cx="20"
                  cy="20"
                  r="16"
                  pathLength="100"
                  strokeDasharray={RATING_CIRCUMFERENCE}
                  strokeDashoffset={ratingOffset}
                />
              </svg>
              <span>{rating.toFixed(1)}</span>
            </div>

            <div className="details-rating__copy">
              <strong>{rating.toFixed(1)}</strong>
              <span>
                {typeof movie?.vote_count === 'number'
                  ? `${movie.vote_count.toLocaleString('pt-BR')} votos`
                  : 'Quantidade de votos indisponivel'}
              </span>
            </div>
          </div>
        ) : null}

        <div className="cta-row">
          <Link className="button-link primary" to={`/movie/${movie?.id}`}>
            Ver detalhes
          </Link>
          {movie?.trailer?.embed_url ? (
            <button type="button" className="button-link" onClick={onOpenTrailer}>
              Assista ao trailer
            </button>
          ) : (
            <button type="button" className="button-link button-link--disabled" disabled>
              Assista ao trailer
            </button>
          )}
        </div>
      </div>
    </section>
  )
}
