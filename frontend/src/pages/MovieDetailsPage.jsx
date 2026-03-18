import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { CastCard } from '../components/CastCard'
import { DetailsHero } from '../components/DetailsHero'
import { HorizontalScroller } from '../components/HorizontalScroller'
import { MovieMediaGallery } from '../components/MovieMediaGallery'
import { MovieTrailer } from '../components/MovieTrailer'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { api } from '../services/api'

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
              : 'Nao foi possivel carregar os detalhes do filme.',
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
      {isLoading ? <p className="status-panel">Carregando detalhes do filme...</p> : null}

      {errorMessage ? (
        <p className="status-panel error" role="alert">
          {errorMessage}
        </p>
      ) : null}

      {!isLoading && !errorMessage && movie ? (
        <>
          <DetailsHero movie={movie} onOpenTrailer={() => setIsTrailerOpen(true)} />

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
              <p className="status-panel">Elenco indisponivel.</p>
            )}
          </section>

          <MovieMediaGallery
            title={movie.title}
            backdropImage={movie.backdrop_image}
            images={movie.images}
          />

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
