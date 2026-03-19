import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { CastCard } from '../components/CastCard'
import { DetailsHero } from '../components/DetailsHero'
import { HorizontalScroller } from '../components/HorizontalScroller'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { MediaPanel } from '../components/MediaPanel'
import { WatchAvailabilityButton } from '../components/WatchAvailabilityButton'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { api } from '../services/api'
import { formatDateBR } from '../utils/date'

function pluralize(value, singular, plural) {
  if (!value) {
    return null
  }

  return value === 1 ? `1 ${singular}` : `${value} ${plural}`
}

function buildTvShowMetadata(tvShow) {
  return [
    formatDateBR(tvShow.release_date),
    tvShow.runtime ? `${tvShow.runtime} min` : null,
    pluralize(tvShow.number_of_seasons, 'temporada', 'temporadas'),
    pluralize(tvShow.number_of_episodes, 'episódio', 'episódios'),
    tvShow.genres?.length ? tvShow.genres.join(', ') : null,
    tvShow.status || null,
    tvShow.vote_average ? `Avaliação ${tvShow.vote_average}` : null,
  ].filter(Boolean)
}

export function TvShowDetailsPage() {
  const { id } = useParams()
  const [tvShow, setTvShow] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useDocumentTitle(tvShow?.title ? `${tvShow.title} | Movie Atlas` : 'Série | Movie Atlas')

  useEffect(() => {
    let isMounted = true
    if (typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }

    async function loadTvShowDetails() {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const payload = await api.getTvShowDetails(id)

        if (isMounted) {
          setTvShow(payload)
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Não foi possível carregar os detalhes da série.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadTvShowDetails()

    return () => {
      isMounted = false
    }
  }, [id])

  return (
    <main className="details-page">
      {isLoading ? (
        <div className="status-panel status-panel--loading">
          <LoadingSpinner label="Carregando detalhes da série" />
        </div>
      ) : null}

      {errorMessage ? (
        <p className="status-panel error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {!isLoading && !errorMessage && tvShow ? (
        <>
          <DetailsHero
            title={tvShow.title}
            synopsis={tvShow.synopsis}
            posterImage={tvShow.poster_image}
            backdropImage={tvShow.backdrop_image}
            trailer={null}
            metadataItems={buildTvShowMetadata(tvShow)}
            primaryCredit={tvShow.creators?.[0] ?? null}
            creditLabel="Criação"
            secondaryAction={
              <WatchAvailabilityButton link={tvShow.watch_providers?.link ?? null} />
            }
          />

          {tvShow.production_companies?.length ? (
            <section className="details-section" aria-label="Produção">
              <div className="section-head">
                <div>
                  <h2>Produção</h2>
                </div>
              </div>
              <p className="status-panel">{tvShow.production_companies.join(', ')}</p>
            </section>
          ) : null}

          <section className="details-section" aria-label="Elenco principal">
            {tvShow.cast?.length ? (
              <HorizontalScroller title="Elenco" labelledBy="tv-show-cast">
                {tvShow.cast.map((person) => (
                  <div key={person.id} className="horizontal-slide" role="listitem">
                    <CastCard person={person} />
                  </div>
                ))}
              </HorizontalScroller>
            ) : (
              <p className="status-panel">Elenco indisponível.</p>
            )}
          </section>

          <MediaPanel title={tvShow.title} media={tvShow.media} />
        </>
      ) : null}
    </main>
  )
}
