import { PeopleListSection } from '../components/PeopleListSection'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useMovieCollection } from '../hooks/useMovieCollection'

export function PeopleListingPage({
  title,
  eyebrow,
  description,
  fetchPeople,
  errorMessageFallback,
}) {
  useDocumentTitle(`${title} | Movie Atlas`)

  const people = useMovieCollection(fetchPeople, errorMessageFallback)

  return (
    <main className="app-shell">
      <section className="page-heading">
        <div className="page-copy">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="lead">{description}</p>
        </div>

        <aside className="page-aside">
          <p>Os cards levam para a pagina individual de cada pessoa.</p>
        </aside>
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
