import { Link } from 'react-router-dom'

import { formatMovieStatus } from '../utils/movieLabels'
import { formatDateBR } from '../utils/date'

export function MovieCard({ movie }) {
  return (
    <article className="movie-card">
      <div className="movie-card__header">
        <p className="movie-card__badge">{formatMovieStatus(movie.status)}</p>
        <p className="movie-card__date">{formatDateBR(movie.release_date) || 'Data indisponível'}</p>
      </div>

      <h2>{movie.title}</h2>
      <p>{movie.synopsis}</p>

      <div className="movie-card__footer">
        <span>{movie.has_trailer ? 'Trailer disponível' : 'Trailer ainda não divulgado'}</span>
        <Link to={`/movie/${movie.id}`} className="text-link">
          Ver detalhes
        </Link>
      </div>
    </article>
  )
}
