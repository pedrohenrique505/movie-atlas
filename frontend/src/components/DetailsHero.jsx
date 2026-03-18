import { DirectorCredit } from './DirectorCredit'

export function DetailsHero({ movie, onOpenTrailer }) {
  const heroStyle = movie.backdrop_image
    ? { backgroundImage: `url(${movie.backdrop_image})` }
    : undefined
  const primaryDirector = movie.directors?.[0] ?? null

  const metadata = [
    movie.release_date,
    movie.runtime ? `${movie.runtime} min` : null,
    movie.genres?.length ? movie.genres.join(', ') : null,
    movie.status || null,
  ].filter(Boolean)

  return (
    <section className="details-hero" style={heroStyle}>
      <div className="details-hero__overlay" />

      <div className="details-hero__content">
        <div className="details-hero__poster-column">
          {movie.poster_image ? (
            <img
              className="details-hero__poster"
              src={movie.poster_image}
              alt={`Poster de ${movie.title}`}
            />
          ) : (
            <div className="details-hero__poster-fallback" aria-hidden="true">
              <span>{movie.title.slice(0, 2).toUpperCase()}</span>
            </div>
          )}
        </div>

        <div className="details-hero__info">
          <p className="eyebrow">Detalhes</p>
          <h1>{movie.title}</h1>

          <div className="details-hero__meta">
            {metadata.map((item) => (
              <span key={item} className="details-hero__meta-item">
                {item}
              </span>
            ))}
            {primaryDirector ? (
              <span className="details-hero__meta-item details-hero__meta-item--director">
                <DirectorCredit director={primaryDirector} />
              </span>
            ) : null}
          </div>

          <div className="details-hero__actions">
            {movie.trailer?.embed_url ? (
              <button className="button-link primary" type="button" onClick={onOpenTrailer}>
                Assista o trailer
              </button>
            ) : (
              <button className="button-link button-link--disabled" type="button" disabled>
                Trailer indisponivel
              </button>
            )}
          </div>

          <p className="details-hero__synopsis">{movie.synopsis}</p>
        </div>
      </div>
    </section>
  )
}
