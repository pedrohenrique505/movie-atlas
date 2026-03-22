export function FavoriteIcon({ active = false }) {
  return (
    <svg viewBox="0 0 24 24" className="action-icon" aria-hidden="true">
      <path
        d="M12 20.6L4.9 13.9C3.1 12.2 2 10.7 2 8.8C2 5.9 4.2 4 7 4C8.6 4 10 4.7 11 5.9C12 4.7 13.4 4 15 4C17.8 4 20 5.9 20 8.8C20 10.7 18.9 12.2 17.1 13.9L12 20.6Z"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}
