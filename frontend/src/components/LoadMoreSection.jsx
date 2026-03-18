export function LoadMoreSection({
  hasItems,
  hasNextPage,
  isLoadingMore,
  errorMessage,
  onLoadMore,
  endMessage = 'Você chegou ao fim desta lista.',
}) {
  if (!hasItems) {
    return null
  }

  return (
    <div className="load-more-section">
      {errorMessage ? (
        <p className="status-panel error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {hasNextPage ? (
        <button type="button" className="button-link" onClick={onLoadMore} disabled={isLoadingMore}>
          {isLoadingMore ? 'Carregando...' : 'Carregar mais'}
        </button>
      ) : (
        <p className="status-panel">{endMessage}</p>
      )}
    </div>
  )
}
