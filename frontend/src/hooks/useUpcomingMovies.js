import { api } from '../services/api'
import { useMovieCollection } from './useMovieCollection'

export function useUpcomingMovies() {
  return useMovieCollection(
    api.getUpcomingMovies,
    'Não foi possível carregar os próximos lançamentos.',
  )
}
