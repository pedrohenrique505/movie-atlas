import { Link } from 'react-router-dom'

export function CastCard({ person }) {
  const initials = person.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <article className="cast-card">
      <Link to={`/person/${person.id}`} className="cast-card__link">
        {person.profile_image ? (
          <img
            className="cast-card__image"
            src={person.profile_image}
            alt={`Foto de ${person.name}`}
          />
        ) : (
          <div className="cast-card__fallback" aria-hidden="true">
            {initials || 'CAST'}
          </div>
        )}

        <div className="cast-card__content">
          <h3>{person.name}</h3>
          <p>{person.character || person.department || 'Pessoa não informada'}</p>
        </div>
      </Link>
    </article>
  )
}
