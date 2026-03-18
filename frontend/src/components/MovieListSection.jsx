import { CollectionFeedback } from './CollectionFeedback'
import { MovieCard } from './MovieCard'
import { MoviePosterCard } from './MoviePosterCard'

export function MovieListSection({
  movies,
  isLoading,
  errorMessage,
  emptyMessage = 'Nenhum filme encontrado.',
  variant = 'details',
  ariaLabel = 'Lista de filmes',
  gridClassName = '',
  buildItemPath,
  datePrefix,
}) {
  if (isLoading || errorMessage || !movies.length) {
    return (
      <CollectionFeedback
        isLoading={isLoading}
        errorMessage={errorMessage}
        emptyMessage={!movies.length ? emptyMessage : ''}
        loadingMessage="Carregando filmes..."
      />
    )
  }

  const sectionClassName = ['movie-grid', gridClassName].filter(Boolean).join(' ')

  return (
    <section className={sectionClassName} aria-label={ariaLabel}>
      {movies.map((movie) => (
        variant === 'poster' ? (
          <MoviePosterCard
            key={movie.id}
            movie={movie}
            to={buildItemPath ? buildItemPath(movie) : `/movie/${movie.id}`}
            datePrefix={datePrefix}
          />
        ) : (
          <MovieCard key={movie.id} movie={movie} />
        )
      ))}
    </section>
  )
}
