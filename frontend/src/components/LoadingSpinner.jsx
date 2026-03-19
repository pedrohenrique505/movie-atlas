export function LoadingSpinner({ label = 'Carregando' }) {
  return (
    <span className="loading-spinner" aria-live="polite" aria-label={label}>
      <span className="loading-spinner__ring" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </span>
  )
}
