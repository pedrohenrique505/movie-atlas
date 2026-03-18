import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { ProjectList } from '../components/ProjectList'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { api } from '../services/api'
import { formatDepartmentLabel } from '../utils/movieLabels'

export function PersonPage() {
  const { id } = useParams()
  const [person, setPerson] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useDocumentTitle(person?.name ? `${person.name} | Movie Atlas` : 'Pessoa | Movie Atlas')

  useEffect(() => {
    let isMounted = true
    if (typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }

    async function loadPersonDetails() {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const payload = await api.getPersonDetails(id)

        if (isMounted) {
          setPerson(payload)
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Nao foi possivel carregar os detalhes da pessoa.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadPersonDetails()

    return () => {
      isMounted = false
    }
  }, [id])

  return (
    <main className="app-shell">
      {isLoading ? <p className="status-panel">Carregando detalhes da pessoa...</p> : null}

      {errorMessage ? (
        <p className="status-panel error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {!isLoading && !errorMessage && person ? (
        <div className="person-page-shell">
          <section className="person-page">
            <div className="person-page__media">
              {person.profile_image ? (
                <img src={person.profile_image} alt={`Foto de ${person.name}`} />
              ) : (
                <div className="person-page__fallback" aria-hidden="true">
                  {person.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <div className="person-page__content">
              <p className="eyebrow">Pessoa</p>
              <h1>{person.name}</h1>

              <div className="details-hero__meta">
                {person.known_for_department ? (
                  <span className="details-hero__meta-item">
                    {formatDepartmentLabel(person.known_for_department)}
                  </span>
                ) : null}
                {person.birthday ? (
                  <span className="details-hero__meta-item">Nascimento: {person.birthday}</span>
                ) : null}
                {person.place_of_birth ? (
                  <span className="details-hero__meta-item">{person.place_of_birth}</span>
                ) : null}
              </div>

              <p className="details-hero__synopsis">{person.biography}</p>
            </div>
          </section>

          <ProjectList projects={person.projects} />
        </div>
      ) : null}
    </main>
  )
}
