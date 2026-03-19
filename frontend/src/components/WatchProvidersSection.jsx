import { WatchAvailabilityButton } from './WatchAvailabilityButton'

export function WatchProvidersSection({ watchProviders, compact = false }) {
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

      <WatchAvailabilityButton link={watchProviders?.link ?? null} />
    </section>
  )
}
