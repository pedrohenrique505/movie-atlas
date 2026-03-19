import { DirectorCredit } from './DirectorCredit'

export function DetailsHero({
  title,
  synopsis,
  posterImage,
  backdropImage,
  trailer,
  metadataItems,
  primaryCredit,
  creditLabel = 'Direção',
  onOpenTrailer,
}) {
  const heroStyle = backdropImage ? { backgroundImage: `url(${backdropImage})` } : undefined

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
                  Trailer indisponível
                </button>
              )}
            </div>
          ) : null}

          <p className="details-hero__synopsis">{synopsis}</p>
        </div>
      </div>
    </section>
  )
}
