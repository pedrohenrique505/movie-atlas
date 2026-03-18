const API_BASE_URL = 'http://localhost:8000/api'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error('Erro ao buscar dados da API.')
  }

  return response.json()
}

export const api = {
  async getTrendingMovies() {
    const data = await request('/movies/trending')
    return data.results ?? []
  },
  async getNowPlayingMovies() {
    const data = await request('/movies/now-playing')
    return data.results ?? []
  },
  async getPopularMovies() {
    const data = await request('/movies/popular')
    return data.results ?? []
  },
  async getUpcomingMovies() {
    const data = await request('/movies/upcoming')
    return data.results ?? []
  },
  async getMovieCategories() {
    const data = await request('/movies/categories')
    return data.results ?? []
  },
  async getPopularTvShows() {
    const data = await request('/tv-shows/popular')
    return data.results ?? []
  },
  async getPopularActors() {
    const data = await request('/people/actors')
    return data.results ?? []
  },
  async getPopularDirectors() {
    const data = await request('/people/directors')
    return data.results ?? []
  },
  getMovieDetails(id) {
    return request(`/movies/${id}`)
  },
  getPersonDetails(id) {
    return request(`/people/${id}`)
  },
}
