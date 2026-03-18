import { PeopleListSection } from '../components/PeopleListSection'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useMovieCollection } from '../hooks/useMovieCollection'

export function PeopleListingPage({
  title,
  fetchPeople,
  errorMessageFallback,
}) {
  useDocumentTitle(`${title} | Movie Atlas`)

  const people = useMovieCollection(fetchPeople, errorMessageFallback)

  return (
    <main className="app-shell">
      <section className="page-heading page-heading--compact">
        <div className="page-copy">
          <h1>{title}</h1>
        </div>
      </section>

      <PeopleListSection
        people={people.movies}
        isLoading={people.isLoading}
        errorMessage={people.errorMessage}
        emptyMessage={`Nenhum resultado encontrado em ${title.toLowerCase()}.`}
        ariaLabel={title}
      />
    </main>
  )
}
