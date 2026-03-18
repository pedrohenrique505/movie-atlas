import { Link } from 'react-router-dom'

function buildInitials(name) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function DirectorCredit({ director }) {
  if (!director) {
    return null
  }

  const initials = buildInitials(director.name)

  return (
    <Link to={`/person/${director.id}`} className="director-credit">
      <span className="director-credit__label">Direcao: {director.name}</span>

      <span className="director-credit__preview" aria-hidden="true">
        {director.profile_image ? (
          <img src={director.profile_image} alt="" />
        ) : (
          <span className="director-credit__fallback">{initials || 'DR'}</span>
        )}
      </span>
    </Link>
  )
}
