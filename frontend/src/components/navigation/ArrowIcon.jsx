export function ArrowIcon({ direction }) {
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
