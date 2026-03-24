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

describe('TvShowsPage', () => {
  it('applies the selected sorting on the tv shows page', async () => {
    createFetchMock((url) => {
      if (url === 'http://localhost:8000/api/tv-shows/categories') {
        return jsonResponse({
          results: [
            { id: '18', name: 'Drama' },
            { id: '10765', name: 'Sci-Fi & Fantasy' },
          ],
        })
      }

      if (url === 'http://localhost:8000/api/tv-shows/popular?page=1') {
        return jsonResponse({
          results: [
            {
              id: '801',
              title: 'Serie Popular',
              release_date: '2025-10-01',
              status: 'tv_show',
              synopsis: 'Serie em destaque.',
              poster_image: 'https://image.tmdb.org/t/p/w780/serie.jpg',
              has_trailer: false,
            },
          ],
          pagination: { page: 1, page_size: 15, has_next: false },
        })
      }

      if (url === 'http://localhost:8000/api/tv-shows/discover?sort_by=vote_average.asc&page=1') {
        return jsonResponse({
          results: [
            {
              id: '811',
              title: 'Serie Ordenada',
              release_date: '2026-03-11',
              status: 'tv_discover',
              synopsis: 'Serie retornada pela ordenacao.',
              poster_image: 'https://image.tmdb.org/t/p/w780/serie-filtrada.jpg',
              has_trailer: false,
            },
          ],
          pagination: { page: 1, page_size: 15, has_next: false },
        })
      }

      throw new Error(`Unhandled URL: ${url}`)
    })

    render(
      <MemoryRouter initialEntries={['/tv-shows']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByText(/serie popular/i)).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: /ordenar por/i })).toBeInTheDocument()

    fireEvent.change(screen.getByRole('combobox', { name: /ordenar por/i }), {
      target: { value: 'vote_average.asc' },
    })

    expect(await screen.findByText(/serie ordenada/i)).toBeInTheDocument()
    expect(screen.queryByText(/serie popular/i)).not.toBeInTheDocument()
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/tv-shows/discover?sort_by=vote_average.asc&page=1',
      expect.any(Object),
    )
  })
})
