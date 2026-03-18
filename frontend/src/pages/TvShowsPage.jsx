import { LoadMoreSection } from '../components/LoadMoreSection'
import { MovieListSection } from '../components/MovieListSection'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { usePaginatedCollection } from '../hooks/usePaginatedCollection'
import { api } from '../services/api'

export function TvShowsPage() {
  useDocumentTitle('Séries | Movie Atlas')

  const shows = usePaginatedCollection(
    api.getPopularTvShows,
    'Não foi possível carregar as séries populares.',
  )

  return (
    <main className="app-shell">
      <section className="page-heading page-heading--compact">
        <div className="page-copy">
          <h1>Séries populares</h1>
        </div>
      </section>

      <MovieListSection
        movies={shows.items}
        isLoading={shows.isLoading}
        errorMessage={shows.isLoading ? shows.errorMessage : ''}
        emptyMessage="Nenhuma série encontrada."
        variant="poster"
        gridClassName="movie-grid--five movie-grid--posters"
        ariaLabel="Lista de séries populares"
        buildItemPath={(show) => `/tv-show/${show.id}`}
      />

      <LoadMoreSection
        hasItems={shows.items.length > 0}
        hasNextPage={shows.hasNextPage}
        isLoadingMore={shows.isLoadingMore}
        errorMessage={!shows.isLoading ? shows.errorMessage : ''}
        onLoadMore={shows.loadMore}
      />
    </main>
  )
}
