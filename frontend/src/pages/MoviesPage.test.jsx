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
  it('renders genre pills and filters the listing with with_genres', async () => {
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

      if (url === 'http://localhost:8000/api/movies/discover?with_genres=28&page=1') {
        return jsonResponse({
          results: [
            {
              id: '902',
              title: 'Filme de Acao',
              release_date: '2026-06-10',
              status: 'discover',
              synopsis: 'Filme filtrado por genero.',
              poster_image: 'https://image.tmdb.org/t/p/w780/action.jpg',
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

    const actionPill = await screen.findByRole('button', { name: /acao/i })
    fireEvent.click(actionPill)

    expect(await screen.findByRole('heading', { name: /filmes por genero/i })).toBeInTheDocument()
    expect(await screen.findByText(/filme de acao/i)).toBeInTheDocument()
    expect(screen.queryByText(/filme popular/i)).not.toBeInTheDocument()
    expect(actionPill).toHaveAttribute('aria-pressed', 'true')
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/movies/discover?with_genres=28&page=1',
      expect.any(Object),
    )
  })
})
