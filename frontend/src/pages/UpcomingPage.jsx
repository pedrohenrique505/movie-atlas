import { LoadMoreSection } from '../components/LoadMoreSection'
import { MovieListSection } from '../components/MovieListSection'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { usePaginatedCollection } from '../hooks/usePaginatedCollection'
import { api } from '../services/api'

export function UpcomingPage() {
  useDocumentTitle('Próximos lançamentos | Movie Atlas')

  const upcoming = usePaginatedCollection(
    api.getUpcomingMovies,
    'Não foi possível carregar os próximos lançamentos.',
  )

  return (
    <main className="app-shell">
      <MovieListSection
        movies={upcoming.items}
        isLoading={upcoming.isLoading}
        errorMessage={upcoming.isLoading ? upcoming.errorMessage : ''}
        emptyMessage="Nenhum próximo lançamento encontrado."
        variant="poster"
        gridClassName="movie-grid--five movie-grid--posters"
        ariaLabel="Lista de próximos lançamentos"
        datePrefix="Data prevista de estreia"
      />

      <LoadMoreSection
        hasItems={upcoming.items.length > 0}
        hasNextPage={upcoming.hasNextPage}
        isLoadingMore={upcoming.isLoadingMore}
        errorMessage={!upcoming.isLoading ? upcoming.errorMessage : ''}
        onLoadMore={upcoming.loadMore}
      />
    </main>
  )
}
