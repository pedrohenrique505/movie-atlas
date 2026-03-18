import { useRef } from 'react'

import { useCarouselOverflow } from '../hooks/useCarouselOverflow'
import { ArrowIcon } from './navigation/ArrowIcon'

export function HorizontalScroller({
  title,
  children,
  className = '',
  labelledBy,
}) {
  const trackRef = useRef(null)
  const hasOverflow = useCarouselOverflow(trackRef, [children])

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
    <div className={`scroller ${className}`.trim()}>
      <div className="section-head">
        <div>
          <h2 id={labelledBy}>{title}</h2>
        </div>

        {hasOverflow ? (
          <div className="carousel-controls" aria-label={`Navegacao de ${title}`}>
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
              aria-label={`Proximo em ${title}`}
            >
              <ArrowIcon direction="right" />
            </button>
          </div>
        ) : null}
      </div>

      <div
        ref={trackRef}
        className="horizontal-track"
        role="list"
        tabIndex={0}
        aria-labelledby={labelledBy}
      >
        {children}
      </div>
    </div>
  )
}
