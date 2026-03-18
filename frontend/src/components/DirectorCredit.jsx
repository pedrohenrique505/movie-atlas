import { Link } from 'react-router-dom'

function buildInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function DirectorCredit({ person, label = 'Direção' }) {
  if (!person) {
    return null
  }

  const initials = buildInitials(person.name)

  return (
    <Link to={`/person/${person.id}`} className="director-credit">
      <span className="director-credit__label">
        {label}: {person.name}
      </span>

      <span className="director-credit__preview" aria-hidden="true">
        {person.profile_image ? (
          <img src={person.profile_image} alt="" />
        ) : (
          <span className="director-credit__fallback">{initials || 'DR'}</span>
        )}
      </span>
    </Link>
  )
}
