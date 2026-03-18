import { api } from '../services/api'
import { useMovieCollection } from './useMovieCollection'

export function useUpcomingMovies() {
  return useMovieCollection(
    api.getUpcomingMovies,
    'Nao foi possivel carregar os proximos lancamentos.',
  )
}
