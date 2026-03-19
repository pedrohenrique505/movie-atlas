import { formatDepartmentLabel } from '../utils/movieLabels'
import { CastCard } from './CastCard'
import { MoviePosterCard } from './MoviePosterCard'

function buildItemPath(item) {
  if (item.media_type === 'tv') {
    return `/tv-show/${item.id}`
  }

  if (item.media_type === 'person') {
    return `/person/${item.id}`
  }

  return `/movie/${item.id}`
}

export function SearchResultsSection({ results }) {
  return (
    <section className="search-results-grid" aria-label="Resultados da busca">
      {results.map((item) => (
        <div
          key={`${item.media_type}-${item.id}`}
          className="search-results-grid__item"
        >
          {item.media_type === 'person' ? (
            <CastCard
              person={{
                id: item.id,
                name: item.name,
                profile_image: item.profile_image,
                character:
                  item.known_for_titles?.join(', ') ||
                  formatDepartmentLabel(item.known_for_department),
              }}
            />
          ) : (
            <MoviePosterCard
              movie={item}
              to={buildItemPath(item)}
            />
          )}
        </div>
      ))}
    </section>
  )
}
