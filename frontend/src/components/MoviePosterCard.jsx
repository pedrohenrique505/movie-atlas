import { Link } from 'react-router-dom'

import { formatDateBR } from '../utils/date'

function buildFallbackLabel(title) {
  return title
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function MoviePosterCard({ movie, datePrefix, to = `/movie/${movie.id}` }) {
  const fallbackLabel = buildFallbackLabel(movie.title)
  const dateLabel = formatDateBR(movie.release_date) || 'Data indisponível'
  const dateText = datePrefix ? `${datePrefix}: ${dateLabel}` : dateLabel
  const content = (
    <>
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

      <div className="poster-card__content">
        <p className="poster-card__date">{dateText}</p>
        <h3>{movie.title}</h3>
      </div>
    </>
  )

  return (
    <article className="poster-card">
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
