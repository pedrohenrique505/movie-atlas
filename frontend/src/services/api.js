const API_BASE_URL = 'http://localhost:8000/api'

class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

function getCookie(name) {
  if (typeof document === 'undefined') {
    return null
  }

  const cookie = document.cookie
    .split(';')
    .map((item) => item.trim())
    .find((item) => item.startsWith(`${name}=`))

  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : null
}

async function parseResponseBody(response) {
  if (response.status === 204) {
    return null
  }

  const contentType = response.headers?.get?.('content-type') ?? 'application/json'

  if (!contentType.includes('application/json')) {
    return null
  }

  return response.json()
}

function buildHeaders(options) {
  const headers = new Headers(options.headers ?? {})
  const method = (options.method ?? 'GET').toUpperCase()
  const hasBody = options.body !== undefined && options.body !== null

  if (hasBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  if (!['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(method)) {
    const csrfToken = getCookie('csrftoken')

    if (csrfToken && !headers.has('X-CSRFToken')) {
      headers.set('X-CSRFToken', csrfToken)
    }
  }

  return headers
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...options,
    headers: buildHeaders(options),
  })

  const data = await parseResponseBody(response)

  if (!response.ok) {
    throw new ApiError(data?.detail ?? 'Erro ao buscar dados da API.', response.status, data)
  }

  return data
}

function buildPathWithPage(path, page = 1) {
  const separator = path.includes('?') ? '&' : '?'
  return `${path}${separator}page=${page}`
}

async function requestPaginatedList(path, page = 1) {
  const data = await request(buildPathWithPage(path, page))
  return {
    results: data?.results ?? [],
    pagination: data?.pagination ?? {
      page,
      page_size: 15,
      has_next: false,
    },
  }
}

function requestJson(path, method, payload) {
  return request(path, {
    method,
    body: payload ? JSON.stringify(payload) : undefined,
  })
}

export const api = {
  async getCurrentUser() {
    return request('/accounts/me/')
  },
  async login(credentials) {
    return requestJson('/accounts/login/', 'POST', credentials)
  },
  async register(payload) {
    return requestJson('/accounts/register/', 'POST', payload)
  },
  async logout() {
    return requestJson('/accounts/logout/', 'POST')
  },
  async sendVerificationEmail() {
    return requestJson('/accounts/verify-email/send/', 'POST')
  },
  async getFavorites() {
    return request('/accounts/favorites/')
  },
  async createFavorite(payload) {
    return requestJson('/accounts/favorites/', 'POST', payload)
  },
  async deleteFavorite(id) {
    return request(`/accounts/favorites/${id}/`, { method: 'DELETE' })
  },
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
  async getTopRatedMovies(options = {}) {
    const page = options.page ?? 1
    if (options.paginated) {
      return requestPaginatedList('/movies/top-rated', page)
    }
    const data = await requestPaginatedList('/movies/top-rated', page)
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
    return data?.results ?? []
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
    return data?.results ?? []
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

export { ApiError }
