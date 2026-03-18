import { LoadMoreSection } from '../components/LoadMoreSection'
import { PeopleListSection } from '../components/PeopleListSection'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { usePaginatedCollection } from '../hooks/usePaginatedCollection'

export function PeopleListingPage({
  title,
  fetchPeople,
  errorMessageFallback,
}) {
  useDocumentTitle(`${title} | Movie Atlas`)

  const people = usePaginatedCollection(fetchPeople, errorMessageFallback)

  return (
    <main className="app-shell">
      <section className="page-heading page-heading--compact">
        <div className="page-copy">
          <h1>{title}</h1>
        </div>
      </section>

      <PeopleListSection
        people={people.items}
        isLoading={people.isLoading}
        errorMessage={people.isLoading ? people.errorMessage : ''}
        emptyMessage={`Nenhum resultado encontrado em ${title.toLowerCase()}.`}
        ariaLabel={title}
      />

      <LoadMoreSection
        hasItems={people.items.length > 0}
        hasNextPage={people.hasNextPage}
        isLoadingMore={people.isLoadingMore}
        errorMessage={!people.isLoading ? people.errorMessage : ''}
        onLoadMore={people.loadMore}
      />
    </main>
  )
}
