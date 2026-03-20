import { HorizontalScroller } from './HorizontalScroller'
import { MoviePosterCard } from './MoviePosterCard'

export function ProjectList({
  projects,
  title = 'Obras',
  labelledBy = 'person-works-heading',
  ariaLabel = 'Obras da pessoa',
  emptyMessage = 'Projetos indisponiveis.',
}) {
  if (!projects?.length) {
    return <p className="status-panel">{emptyMessage}</p>
  }

  return (
    <section className="details-section" aria-label={ariaLabel}>
      <HorizontalScroller title={title} labelledBy={labelledBy}>
        {projects.map((project) => (
          <div key={`${project.media_type}-${project.id}`} className="horizontal-slide">
            <MoviePosterCard
              movie={project}
              to={project.media_type === 'tv' ? `/tv-show/${project.id}` : `/movie/${project.id}`}
            />
          </div>
        ))}
      </HorizontalScroller>
    </section>
  )
}
