export function CatalogFiltersCard({
  sortOptions,
  selectedSortBy,
  onSortChange,
  genres,
  selectedGenreId,
  onGenreChange,
  isLoadingGenres,
  genreErrorMessage,
}) {
  return (
    <div className="catalog-filter-card">
      <div className="catalog-filter-card__header">
        <h2>Filtros</h2>
      </div>

      <div className="catalog-filter-card__section">
        <h3 className="catalog-filter-section-title">Ordenação</h3>
        <label className="catalog-filter-field">
          <span className="catalog-filter-field__label">Ordenar por</span>
          <select
            className="catalog-filter-select"
            value={selectedSortBy}
            onChange={(event) => onSortChange(event.target.value)}
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="catalog-filter-card__section">
        <h3 className="catalog-filter-section-title">Gêneros</h3>
        <label className="catalog-filter-field">
          <span className="catalog-filter-field__label">Filtrar por gênero</span>
          <select
            className="catalog-filter-select"
            value={selectedGenreId}
            onChange={(event) => onGenreChange(event.target.value)}
          >
            <option value="">Todos os gêneros</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </label>

        {isLoadingGenres ? <p className="catalog-filter-status">Carregando gêneros...</p> : null}
        {genreErrorMessage ? (
          <p className="catalog-filter-status error" role="alert">
            {genreErrorMessage}
          </p>
        ) : null}
      </div>
    </div>
  )
}
