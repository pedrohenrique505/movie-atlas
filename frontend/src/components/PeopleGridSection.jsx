import { useMediaQuery } from '../hooks/useMediaQuery'
import { PeopleListSection } from './PeopleListSection'
import { PeopleCarouselSection } from './PeopleCarouselSection'

export function PeopleGridSection({
  title,
  eyebrow,
  people,
  isLoading,
  errorMessage,
  emptyMessage,
}) {
  const isMobile = useMediaQuery('(max-width: 860px)')

  if (isMobile) {
    return (
      <PeopleCarouselSection
        title={title}
        eyebrow={eyebrow}
        people={people}
        isLoading={isLoading}
        errorMessage={errorMessage}
        emptyMessage={emptyMessage}
      />
    )
  }

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
