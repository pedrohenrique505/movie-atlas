import { MovieListSection } from './MovieListSection'

export function MovieGridSection({
  title,
  eyebrow,
  movies,
  isLoading,
  errorMessage,
  emptyMessage,
  datePrefix,
}) {
  return (
    <section className="home-grid-section" aria-label={title}>
      <div className="section-head">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
      </div>

      <MovieListSection
        movies={movies}
        isLoading={isLoading}
        errorMessage={errorMessage}
        emptyMessage={emptyMessage}
        variant="poster"
        gridClassName="movie-grid--five movie-grid--posters"
        ariaLabel={title}
        datePrefix={datePrefix}
      />
    </section>
  )
}
