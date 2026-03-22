import { Link } from 'react-router-dom'

import { FavoriteToggleButton } from './FavoriteToggleButton'
import { formatDateBR } from '../utils/date'

const RATING_CIRCUMFERENCE = 100

function buildFallbackLabel(title) {
  return title
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function normalizeRating(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return null
  }

  return Math.min(Math.max(value, 0), 10)
}

function getRatingTone(value) {
  if (value <= 4) {
    return 'danger'
  }

  if (value <= 7) {
    return 'warning'
  }

  return 'success'
}

function inferMediaType(movie, to) {
  if (movie.media_type === 'tv' || to?.startsWith('/tv-show/')) {
    return 'tv'
  }

  return 'movie'
}

export function MoviePosterCard({
  movie,
  datePrefix,
  to = `/movie/${movie.id}`,
  showFavoriteAction = true,
}) {
  const fallbackLabel = buildFallbackLabel(movie.title)
  const dateLabel = formatDateBR(movie.release_date) || 'Data indispon\u00edvel'
  const dateText = datePrefix ? `${datePrefix}: ${dateLabel}` : dateLabel
  const rating = normalizeRating(movie.vote_average)
  const ratingTone = rating === null ? null : getRatingTone(rating)
  const ratingOffset =
    rating === null ? null : RATING_CIRCUMFERENCE - (rating / 10) * RATING_CIRCUMFERENCE
  const mediaType = inferMediaType(movie, to)
  const numericTmdbId = Number(movie.id)

  const content = (
    <>
      <div className="poster-card__media">
        {rating !== null ? (
          <div
            className={`poster-card__rating poster-card__rating--${ratingTone}`}
            aria-label={`Nota ${rating.toFixed(1)}`}
          >
            <svg
              className="poster-card__rating-ring"
              viewBox="0 0 40 40"
              aria-hidden="true"
            >
              <circle className="poster-card__rating-track" cx="20" cy="20" r="16" />
              <circle
                className="poster-card__rating-progress"
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
        ) : null}
        {movie.poster_image ? (
          <img
            className="poster-card__image"
            src={movie.poster_image}
            alt={`Poster de ${movie.title}`}
          />
        ) : (
          <div className="poster-card__visual" aria-hidden="true">
            <span>{fallbackLabel || 'FILM'}</span>
          </div>
        )}
      </div>

      <div className="poster-card__content">
        <h3>{movie.title}</h3>
        <p className="poster-card__date">{dateText}</p>
      </div>
    </>
  )

  return (
    <article className="poster-card">
      {showFavoriteAction && Number.isFinite(numericTmdbId) ? (
        <div className="poster-card__favorite">
          <FavoriteToggleButton
            tmdbId={numericTmdbId}
            mediaType={mediaType}
            variant="icon"
            activeTooltip="Remover dos favoritos"
            inactiveTooltip="Adicionar aos favoritos"
          />
        </div>
      ) : null}

      {to ? (
        <Link className="poster-card__link" to={to}>
          {content}
        </Link>
      ) : (
        <div className="poster-card__link poster-card__link--static">{content}</div>
      )}
    </article>
  )
}
