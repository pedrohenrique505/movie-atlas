import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import App from '../App'

function jsonResponse(payload, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(payload),
  })
}

function createFetchMock(handler) {
  global.fetch = vi.fn((url, requestOptions) => {
    if (url === 'http://localhost:8000/api/accounts/me/') {
      return jsonResponse({ detail: 'Authentication credentials were not provided.' }, 403)
    }

    return handler(url, requestOptions)
  })
}

describe('MoviesPage', () => {
  it('applies the selected sorting on the movies page', async () => {
    createFetchMock((url) => {
      if (url === 'http://localhost:8000/api/movies/categories') {
        return jsonResponse({
          results: [
            { id: '28', name: 'Acao' },
            { id: '18', name: 'Drama' },
          ],
        })
      }

      if (url === 'http://localhost:8000/api/movies/popular?page=1') {
        return jsonResponse({
          results: [
            {
              id: '901',
              title: 'Filme Popular',
              release_date: '2026-05-22',
              status: 'popular',
              synopsis: 'Filme popular do momento.',
              poster_image: 'https://image.tmdb.org/t/p/w780/popular.jpg',
              has_trailer: false,
            },
          ],
          pagination: { page: 1, page_size: 15, has_next: false },
        })
      }

      if (url === 'http://localhost:8000/api/movies/discover?sort_by=vote_average.asc&page=1') {
        return jsonResponse({
          results: [
            {
              id: '902',
              title: 'Filme Ordenado',
              release_date: '2026-06-10',
              status: 'discover',
              synopsis: 'Filme retornado pela ordenacao.',
              poster_image: 'https://image.tmdb.org/t/p/w780/ordered.jpg',
              has_trailer: false,
            },
          ],
          pagination: { page: 1, page_size: 15, has_next: false },
        })
      }

      throw new Error(`Unhandled URL: ${url}`)
    })

    render(
      <MemoryRouter initialEntries={['/movies']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByText(/filme popular/i)).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /ordenar por/i })).toBeInTheDocument()

    fireEvent.change(screen.getByRole('combobox', { name: /ordenar por/i }), {
      target: { value: 'vote_average.asc' },
    })

    expect(await screen.findByText(/filme ordenado/i)).toBeInTheDocument()
    expect(screen.queryByText(/filme popular/i)).not.toBeInTheDocument()
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/movies/discover?sort_by=vote_average.asc&page=1',
      expect.any(Object),
    )
  })
})
