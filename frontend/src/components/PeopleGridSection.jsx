import { PeopleListSection } from './PeopleListSection'

export function PeopleGridSection({
  title,
  eyebrow,
  people,
  isLoading,
  errorMessage,
  emptyMessage,
}) {
  return (
    <section className="home-grid-section" aria-label={title}>
      <div className="section-head">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
      </div>

      <PeopleListSection
        people={people}
        isLoading={isLoading}
        errorMessage={errorMessage}
        emptyMessage={emptyMessage}
        ariaLabel={title}
      />
    </section>
  )
}
