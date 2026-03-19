import { LoadingSpinner } from './LoadingSpinner'

export function CollectionFeedback({
  isLoading,
  errorMessage,
  emptyMessage,
  loadingLabel = 'Carregando conteúdo',
}) {
  if (isLoading) {
    return (
      <div className="status-panel status-panel--loading">
        <LoadingSpinner label={loadingLabel} />
      </div>
    )
  }

  if (errorMessage) {
    return (
      <p className="status-panel error" role="alert">
        {errorMessage}
      </p>
    )
  }

  if (emptyMessage) {
    return <p className="status-panel">{emptyMessage}</p>
  }

  return null
}
