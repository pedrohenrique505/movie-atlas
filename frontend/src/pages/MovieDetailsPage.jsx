import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { CastCard } from '../components/CastCard'
import { DetailsHero } from '../components/DetailsHero'
import { FavoriteToggleButton } from '../components/FavoriteToggleButton'
import { HorizontalScroller } from '../components/HorizontalScroller'
import { MediaPanel } from '../components/MediaPanel'
import { MovieTrailer } from '../components/MovieTrailer'
import { WatchAvailabilityButton } from '../components/WatchAvailabilityButton'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { api } from '../services/api'
import { formatDateBR } from '../utils/date'

function buildMovieMetadata(movie) {
  return [
    formatDateBR(movie.release_date),
    movie.runtime ? `${movie.runtime} min` : null,
    movie.genres?.length ? movie.genres.join(', ') : null,
    movie.status || null,
  ].filter(Boolean)
}

export function MovieDetailsPage() {
  const { id } = useParams()
  const [movie, setMovie] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [isTrailerOpen, setIsTrailerOpen] = useState(false)

  useDocumentTitle(movie?.title ? `${movie.title} | Movie Atlas` : 'Filme | Movie Atlas')

  useEffect(() => {
    let isMounted = true
    if (typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }
    setIsTrailerOpen(false)

    async function loadMovieDetails() {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const payload = await api.getMovieDetails(id)

        if (isMounted) {
          setMovie(payload)
        }
      } catch (error) {
        if (isMounted) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Não foi possível carregar os detalhes do filme.',
          )
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadMovieDetails()

    return () => {
      isMounted = false
    }
  }, [id])

  return (
    <main className="details-page">
      {isLoading ? (
        <div className="status-panel status-panel--loading">
          <LoadingSpinner label="Carregando detalhes do filme" />
        </div>
      ) : null}

      {errorMessage ? (
        <p className="status-panel error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {!isLoading && !errorMessage && movie ? (
        <>
          <DetailsHero
            title={movie.title}
            originalTitle={movie.original_title ?? ''}
            synopsis={movie.synopsis}
            posterImage={movie.poster_image}
            backdropImage={movie.backdrop_image}
            trailer={movie.trailer}
            voteAverage={movie.vote_average}
            voteCount={movie.vote_count}
            metadataItems={buildMovieMetadata(movie)}
            primaryCredit={movie.directors?.[0] ?? null}
            creditLabel="Direção"
            onOpenTrailer={() => setIsTrailerOpen(true)}
            secondaryAction={
              <>
                <FavoriteToggleButton tmdbId={Number(id)} mediaType="movie" />
                <WatchAvailabilityButton link={movie.watch_providers?.link ?? null} />
              </>
            }
          />

          <section className="details-section" aria-label="Elenco">
            {movie.cast?.length ? (
              <HorizontalScroller title="Elenco" labelledBy="movie-cast">
                {movie.cast.map((person) => (
                  <div key={person.id} className="horizontal-slide" role="listitem">
                    <CastCard person={person} />
                  </div>
                ))}
              </HorizontalScroller>
            ) : (
              <p className="status-panel">Elenco indisponível.</p>
            )}
          </section>

          <MediaPanel title={movie.title} media={movie.media} />

          <MovieTrailer
            trailer={movie.trailer}
            isOpen={isTrailerOpen}
            onClose={() => setIsTrailerOpen(false)}
          />
        </>
      ) : null}
    </main>
  )
}
