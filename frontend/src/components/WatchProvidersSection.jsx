export function WatchProvidersSection({ watchProviders, compact = false }) {
  const detailsLink = watchProviders?.link ?? null

  return (
    <section
      className={`details-section ${compact ? 'details-section--compact' : ''}`.trim()}
      aria-label="Onde assistir"
    >
      <div className="section-head">
        <div>
          <h2>Onde assistir</h2>
        </div>
      </div>

      {detailsLink ? (
        <a
          className="button-link watch-availability-button"
          href={detailsLink}
          target="_blank"
          rel="noreferrer"
        >
          Onde posso assistir?
        </a>
      ) : (
        <button
          type="button"
          className="button-link button-link--disabled watch-availability-button"
          disabled
        >
          Onde posso assistir?
        </button>
      )}
    </section>
  )
}
