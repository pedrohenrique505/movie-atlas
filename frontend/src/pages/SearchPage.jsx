import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { MovieListSection } from '../components/MovieListSection'
import { CollectionFeedback } from '../components/CollectionFeedback'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { api } from '../services/api'

export function SearchPage() {
  const [searchParams] = useSearchParams()
  const query = (searchParams.get('q') ?? '').trim()
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useDocumentTitle(query ? `Busca: ${query} | Movie Atlas` : 'Busca | Movie Atlas')

  useEffect(() => {
    let isMounted = true

    async function loadSearchResults() {
      if (!query) {
        setResults([])
        setErrorMessage('')
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setErrorMessage('')
        setResults([])

        const payload = await api.searchMovies(query)

        if (isMounted) {
          setResults(payload)
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Não foi possível concluir a busca.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadSearchResults()

    return () => {
      isMounted = false
    }
  }, [query])

  return (
    <main className="app-shell">
      <section className="page-heading page-heading--compact">
        <div className="page-copy">
          <h1>{query ? `Resultados para "${query}"` : 'Buscar filmes'}</h1>
        </div>
      </section>

      {!query ? (
          <CollectionFeedback
            isLoading={false}
            errorMessage=""
            emptyMessage="Digite um título para iniciar a busca."
          />
      ) : (
        <MovieListSection
          movies={results}
          isLoading={isLoading}
          errorMessage={errorMessage}
          emptyMessage={`Nenhum resultado encontrado para "${query}".`}
          variant="poster"
          gridClassName="movie-grid--five movie-grid--posters"
          ariaLabel="Resultados da busca"
        />
      )}
    </main>
  )
}
