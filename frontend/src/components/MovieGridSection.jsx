import { MovieCarouselSection } from './MovieCarouselSection'
import { MovieListSection } from './MovieListSection'
import { useMediaQuery } from '../hooks/useMediaQuery'

export function MovieGridSection({
  title,
  eyebrow,
  movies,
  isLoading,
  errorMessage,
  emptyMessage,
  datePrefix,
}) {
  const isMobile = useMediaQuery('(max-width: 860px)')

  if (isMobile) {
    return (
      <MovieCarouselSection
        title={title}
        eyebrow={eyebrow}
        movies={movies}
        isLoading={isLoading}
        errorMessage={errorMessage}
        emptyMessage={emptyMessage}
        datePrefix={datePrefix}
      />
    )
  }

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
