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

function buildPathWithPage(path, page = 1) {
  const separator = path.includes('?') ? '&' : '?'
  return `${path}${separator}page=${page}`
}

async function requestPaginatedList(path, page = 1) {
  const data = await request(buildPathWithPage(path, page))
  return {
    results: data.results ?? [],
    pagination: data.pagination ?? {
      page,
      page_size: 15,
      has_next: false,
    },
  }
}

export const api = {
  async getTrendingMovies(options = {}) {
    const page = options.page ?? 1
    if (options.paginated) {
      return requestPaginatedList('/movies/trending', page)
    }
    const data = await requestPaginatedList('/movies/trending', page)
    return data.results
  },
  async getNowPlayingMovies(options = {}) {
    const page = options.page ?? 1
    if (options.paginated) {
      return requestPaginatedList('/movies/now-playing', page)
    }
    const data = await requestPaginatedList('/movies/now-playing', page)
    return data.results
  },
  async getPopularMovies(options = {}) {
    const page = options.page ?? 1
    if (options.paginated) {
      return requestPaginatedList('/movies/popular', page)
    }
    const data = await requestPaginatedList('/movies/popular', page)
    return data.results
  },
  async getUpcomingMovies(options = {}) {
    const page = options.page ?? 1
    if (options.paginated) {
      return requestPaginatedList('/movies/upcoming', page)
    }
    const data = await requestPaginatedList('/movies/upcoming', page)
    return data.results
  },
  async getMovieCategories() {
    const data = await request('/movies/categories')
    return data.results ?? []
  },
  async getPopularTvShows(options = {}) {
    const page = options.page ?? 1
    if (options.paginated) {
      return requestPaginatedList('/tv-shows/popular', page)
    }
    const data = await requestPaginatedList('/tv-shows/popular', page)
    return data.results
  },
  async getPopularActors(options = {}) {
    const page = options.page ?? 1
    if (options.paginated) {
      return requestPaginatedList('/people/actors', page)
    }
    const data = await requestPaginatedList('/people/actors', page)
    return data.results
  },
  async getPopularDirectors(options = {}) {
    const page = options.page ?? 1
    if (options.paginated) {
      return requestPaginatedList('/people/directors', page)
    }
    const data = await requestPaginatedList('/people/directors', page)
    return data.results
  },
  async searchMovies(query) {
    const data = await request(`/search?q=${encodeURIComponent(query)}`)
    return data.results ?? []
  },
  getMovieDetails(id) {
    return request(`/movies/${id}`)
  },
  getTvShowDetails(id) {
    return request(`/tv-shows/${id}`)
  },
  getPersonDetails(id) {
    return request(`/people/${id}`)
  },
  async getTrendingPeople(options = {}) {
    const page = options.page ?? 1
    if (options.paginated) {
      return requestPaginatedList('/people/trending', page)
    }
    const data = await requestPaginatedList('/people/trending', page)
    return data.results
  },
}
