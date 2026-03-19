export function WatchProvidersSection({ watchProviders }) {
  const categories = watchProviders?.categories ?? []
  const detailsLink = watchProviders?.link ?? null

  return (
    <section className="details-section" aria-label="Onde assistir">
      <div className="section-head">
        <div>
          <h2>Onde assistir</h2>
        </div>
      </div>

      {categories.length ? (
        <div className="provider-groups">
          {categories.map((category) => (
            <div key={category.key} className="provider-group">
              <div className="provider-group__header">
                <h3>{category.label}</h3>
                {detailsLink ? (
                  <a
                    className="text-link"
                    href={detailsLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver disponibilidade
                  </a>
                ) : null}
              </div>

              <div className="provider-grid">
                {category.providers.map((provider) => {
                  const content = (
                    <>
                      {provider.logo_image ? (
                        <img src={provider.logo_image} alt="" aria-hidden="true" />
                      ) : (
                        <div className="provider-card__fallback" aria-hidden="true">
                          <span>{provider.name.slice(0, 2).toUpperCase()}</span>
                        </div>
                      )}
                      <span>{provider.name}</span>
                    </>
                  )

                  return provider.link ? (
                    <a
                      key={provider.id}
                      className="provider-card"
                      href={provider.link}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {content}
                    </a>
                  ) : (
                    <div key={provider.id} className="provider-card">
                      {content}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="status-panel">Nenhum provedor disponível para esta obra no momento.</p>
      )}
    </section>
  )
}
