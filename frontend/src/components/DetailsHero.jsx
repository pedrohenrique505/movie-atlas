import { DirectorCredit } from './DirectorCredit'

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

export function DetailsHero({
  title,
  synopsis,
  posterImage,
  backdropImage,
  trailer,
  metadataItems,
  primaryCredit,
  creditLabel = 'Direcao',
  onOpenTrailer,
  secondaryAction,
  voteAverage = null,
  voteCount = null,
}) {
  const heroStyle = backdropImage ? { backgroundImage: `url(${backdropImage})` } : undefined
  const rating = normalizeRating(voteAverage)
  const ratingTone = rating === null ? null : getRatingTone(rating)
  const ratingOffset =
    rating === null ? null : RATING_CIRCUMFERENCE - (rating / 10) * RATING_CIRCUMFERENCE

  return (
    <section className="details-hero" style={heroStyle}>
      <div className="details-hero__overlay" />

      <div className="details-hero__content">
        <div className="details-hero__poster-column">
          {posterImage ? (
            <img className="details-hero__poster" src={posterImage} alt={`Poster de ${title}`} />
          ) : (
            <div className="details-hero__poster-fallback" aria-hidden="true">
              <span>{title.slice(0, 2).toUpperCase()}</span>
            </div>
          )}
        </div>

        <div className="details-hero__info">
          <p className="eyebrow">Detalhes</p>
          <h1>{title}</h1>

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
                  {typeof voteCount === 'number'
                    ? `${voteCount.toLocaleString('pt-BR')} votos`
                    : 'Quantidade de votos indisponivel'}
                </span>
              </div>
            </div>
          ) : null}

          <div className="details-hero__meta">
            {metadataItems.map((item) => (
              <span key={item} className="details-hero__meta-item">
                {item}
              </span>
            ))}
            {primaryCredit ? (
              <span className="details-hero__meta-item details-hero__meta-item--director">
                <DirectorCredit person={primaryCredit} label={creditLabel} />
              </span>
            ) : null}
          </div>

          {trailer || onOpenTrailer ? (
            <div className="details-hero__actions">
              {trailer?.embed_url ? (
                <button className="button-link primary" type="button" onClick={onOpenTrailer}>
                  Assista ao trailer
                </button>
              ) : (
                <button className="button-link button-link--disabled" type="button" disabled>
                  Trailer indisponivel
                </button>
              )}
              {secondaryAction}
            </div>
          ) : secondaryAction ? (
            <div className="details-hero__actions">{secondaryAction}</div>
          ) : null}

          <p className="details-hero__synopsis">{synopsis}</p>
        </div>
      </div>
    </section>
  )
}
