export function CollectionFeedback({
  isLoading,
  errorMessage,
  emptyMessage,
  loadingMessage = 'Carregando filmes...',
}) {
  if (isLoading) {
    return <p className="status-panel">{loadingMessage}</p>
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
