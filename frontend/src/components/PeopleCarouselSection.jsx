import { useRef } from 'react'

import { useCarouselOverflow } from '../hooks/useCarouselOverflow'
import { formatDepartmentLabel } from '../utils/movieLabels'
import { CastCard } from './CastCard'
import { CollectionFeedback } from './CollectionFeedback'
import { ArrowIcon } from './navigation/ArrowIcon'

export function PeopleCarouselSection({
  title,
  eyebrow,
  people,
  isLoading,
  errorMessage,
  emptyMessage,
}) {
  const trackRef = useRef(null)
  const hasOverflow = useCarouselOverflow(trackRef, [people])

  function scrollTrack(direction) {
    if (!trackRef.current) {
      return
    }

    const amount = Math.round(trackRef.current.clientWidth * 0.9)
    trackRef.current.scrollBy({
      left: direction * amount,
      behavior: 'smooth',
    })
  }

  return (
    <section className="carousel-section" aria-label={title}>
      <div className="section-head">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>

        {hasOverflow ? (
          <div className="carousel-controls" aria-label={`Navegação de ${title}`}>
            <button
              type="button"
              className="carousel-button"
              onClick={() => scrollTrack(-1)}
              aria-label={`Anterior em ${title}`}
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              type="button"
              className="carousel-button"
              onClick={() => scrollTrack(1)}
              aria-label={`Próximo em ${title}`}
            >
              <ArrowIcon direction="right" />
            </button>
          </div>
        ) : null}
      </div>

      {isLoading || errorMessage || !people.length ? (
        <CollectionFeedback
          isLoading={isLoading}
          errorMessage={errorMessage}
          emptyMessage={!people.length ? emptyMessage : ''}
          loadingLabel="Carregando pessoas"
        />
      ) : null}

      {!isLoading && !errorMessage && people.length ? (
        <div ref={trackRef} className="horizontal-track" role="list" tabIndex={0}>
          {people.map((person) => (
            <div key={person.id} className="horizontal-slide" role="listitem">
              <CastCard
                person={{
                  ...person,
                  character:
                    person.known_for_titles?.join(', ') ||
                    formatDepartmentLabel(person.known_for_department),
                }}
              />
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}
