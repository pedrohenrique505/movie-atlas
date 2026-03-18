import { useRef } from 'react'

function ArrowIcon({ direction }) {
  const points = direction === 'left' ? '15 6 9 12 15 18' : '9 6 15 12 9 18'

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="carousel-button__icon">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function HorizontalScroller({
  title,
  children,
  className = '',
  labelledBy,
}) {
  const trackRef = useRef(null)

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
