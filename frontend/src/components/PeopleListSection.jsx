import { formatDepartmentLabel } from '../utils/movieLabels'
import { CastCard } from './CastCard'
import { CollectionFeedback } from './CollectionFeedback'

export function PeopleListSection({
  people,
  isLoading,
  errorMessage,
  emptyMessage,
  ariaLabel,
}) {
  if (isLoading || errorMessage || !people.length) {
    return (
      <CollectionFeedback
        isLoading={isLoading}
        errorMessage={errorMessage}
        emptyMessage={!people.length ? emptyMessage : ''}
        loadingLabel="Carregando pessoas"
      />
    )
  }

  return (
    <section className="people-grid" aria-label={ariaLabel}>
      {people.map((person) => (
        <CastCard
          key={person.id}
          person={{
            ...person,
            character:
              person.known_for_titles?.join(', ') ||
              formatDepartmentLabel(person.known_for_department),
          }}
        />
      ))}
    </section>
  )
}
