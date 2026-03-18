import { HorizontalScroller } from './HorizontalScroller'
import { MoviePosterCard } from './MoviePosterCard'

export function ProjectList({ projects }) {
  if (!projects?.length) {
    return <p className="status-panel">Projetos indisponiveis.</p>
  }

  return (
    <section className="details-section" aria-label="Obras da pessoa">
      <HorizontalScroller title="Obras" labelledBy="person-works-heading">
        {projects.map((project) => (
          <div key={`${project.id}-${project.credit}`} className="horizontal-slide">
            <MoviePosterCard
              movie={project}
              to={project.media_type === 'movie' ? `/movie/${project.id}` : null}
            />
          </div>
        ))}
      </HorizontalScroller>
    </section>
  )
}
