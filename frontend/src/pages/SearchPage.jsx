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
              : 'Nao foi possivel concluir a busca.',
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
      <section className="page-heading">
        <div className="page-copy">
          <p className="eyebrow">Busca</p>
          <h1>{query ? `Resultados para "${query}"` : 'Buscar filmes'}</h1>
          <p className="lead">
            {query
              ? 'Resultados encontrados a partir do titulo pesquisado.'
              : 'Digite um titulo no campo de busca para encontrar filmes.'}
          </p>
        </div>

        <aside className="page-aside">
          <p>Os resultados direcionam para a pagina de detalhes quando houver rota disponivel.</p>
        </aside>
      </section>

      {!query ? (
        <CollectionFeedback
          isLoading={false}
          errorMessage=""
          emptyMessage="Digite um titulo para iniciar a busca."
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
