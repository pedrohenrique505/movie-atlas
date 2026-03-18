import { Link } from 'react-router-dom'

function formatProjectMeta(project) {
  const parts = []

  if (project.media_type) {
    parts.push(project.media_type === 'tv' ? 'TV' : 'Filme')
  }

  if (project.release_date) {
    parts.push(project.release_date)
  }

  if (project.credit) {
    parts.push(project.credit)
  }

  return parts.join(' • ')
}

export function ProjectList({ projects }) {
  if (!projects?.length) {
    return <p className="status-panel">Projetos indisponiveis.</p>
  }

  return (
    <section className="details-section" aria-label="Projetos da pessoa">
      <div className="section-head">
        <div>
          <h2>Projetos</h2>
        </div>
      </div>

      <div className="project-list">
        {projects.map((project) => (
          <article key={`${project.id}-${project.credit}`} className="project-list__item">
            <div>
              <h3>{project.title}</h3>
              <p>{formatProjectMeta(project)}</p>
            </div>

            {project.media_type === 'movie' ? (
              <Link to={`/movie/${project.id}`} className="text-link">
                Ver filme
              </Link>
            ) : (
              <span className="project-list__label">Detalhe de TV em breve</span>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
