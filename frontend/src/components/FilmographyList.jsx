import { Link } from 'react-router-dom'

function getYearLabel(releaseDate) {
  if (!releaseDate) {
    return '—'
  }

  const match = /^(\d{4})/.exec(releaseDate)
  return match ? match[1] : '—'
}

export function FilmographyList({
  projects,
  title = 'Filmografia',
  labelledBy = 'person-filmography-heading',
  ariaLabel = 'Filmografia da pessoa',
  emptyMessage = 'Filmografia indisponivel.',
}) {
  if (!projects?.length) {
    return <p className="status-panel">{emptyMessage}</p>
  }

  return (
    <section className="details-section filmography-list-section" aria-label={ariaLabel}>
      <div className="section-head">
        <div>
          <h2 id={labelledBy}>{title}</h2>
        </div>
      </div>

      <div className="filmography-list" role="list" aria-labelledby={labelledBy}>
        {projects.map((project, index) => (
          <Link
            key={`${project.media_type}-${project.id}-${index}`}
            className="filmography-list__item"
            role="listitem"
            to={project.media_type === 'tv' ? `/tv-show/${project.id}` : `/movie/${project.id}`}
          >
            <span className="filmography-list__year">{getYearLabel(project.release_date)}</span>
            <div className="filmography-list__content">
              <strong>{project.title}</strong>
              {project.credit ? <span>{project.credit}</span> : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
