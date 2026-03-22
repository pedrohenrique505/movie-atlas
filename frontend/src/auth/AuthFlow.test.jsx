import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import App from '../App'

function jsonResponse(payload, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(payload),
  })
}

function renderApp(initialEntry) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <App />
    </MemoryRouter>,
  )
}

describe('Auth and favorites flow', () => {
  it('creates an account from the auth modal and logs the user in automatically', async () => {
    delete globalThis.__MOVIE_ATLAS_DISABLE_AUTH_BOOTSTRAP__

    let meRequestCount = 0

    global.fetch = vi.fn((url) => {
      if (url === 'http://localhost:8000/api/accounts/me/') {
        meRequestCount += 1

        if (meRequestCount === 1) {
          return jsonResponse({ detail: 'Authentication credentials were not provided.' }, 403)
        }

        return jsonResponse({
          id: 11,
          username: 'newuser',
          email: 'newuser@example.com',
          is_email_verified: false,
        })
      }

      if (url === 'http://localhost:8000/api/accounts/register/') {
        return jsonResponse({
          id: 11,
          username: 'newuser',
          email: 'newuser@example.com',
          is_email_verified: false,
        }, 201)
      }

      if (url === 'http://localhost:8000/api/accounts/login/') {
        return jsonResponse({
          id: 11,
          username: 'newuser',
          email: 'newuser@example.com',
          is_email_verified: false,
        })
      }

      if (url === 'http://localhost:8000/api/accounts/favorites/') {
        return jsonResponse([])
      }

      if (url === 'http://localhost:8000/api/movies/popular?page=1') {
        return jsonResponse({
          results: [],
          pagination: { page: 1, page_size: 15, has_next: false },
        })
      }

      return Promise.reject(new Error(`URL inesperada: ${url}`))
    })

    renderApp('/movies')

    fireEvent.click(await screen.findByRole('button', { name: /entrar/i }))
    fireEvent.click(screen.getByRole('tab', { name: /criar conta/i }))
    fireEvent.change(screen.getByLabelText(/usuario/i), {
      target: { value: 'newuser' },
    })
    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: 'newuser@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'strong-pass-123' },
    })
    fireEvent.click(
      within(screen.getByRole('dialog', { name: /criar conta/i })).getByRole('button', {
        name: /criar conta/i,
      }),
    )

    expect(await screen.findAllByText(/newuser/i)).toHaveLength(2)
    expect(await screen.findByText(/seu e-mail ainda nao foi verificado/i)).toBeInTheDocument()
  })

  it('allows a verified user to favorite a movie and see it in the favorites page', async () => {
    delete globalThis.__MOVIE_ATLAS_DISABLE_AUTH_BOOTSTRAP__

    const currentUser = {
      id: 7,
      username: 'moviefan',
      email: 'moviefan@example.com',
      is_email_verified: true,
    }

    let favoritesPayload = []

    global.fetch = vi.fn((url, options) => {
      if (url === 'http://localhost:8000/api/accounts/me/') {
        return jsonResponse(currentUser)
      }

      if (url === 'http://localhost:8000/api/accounts/favorites/' && !options?.method) {
        return jsonResponse(favoritesPayload)
      }

      if (url === 'http://localhost:8000/api/accounts/favorites/' && options?.method === 'POST') {
        favoritesPayload = [
          {
            id: 91,
            tmdb_id: 101,
            media_type: 'movie',
            created_at: '2026-03-21T10:00:00-03:00',
          },
        ]

        return jsonResponse(favoritesPayload[0], 201)
      }

      if (url === 'http://localhost:8000/api/movies/101') {
        return jsonResponse({
          id: '101',
          title: 'The Odyssey',
          synopsis: 'Uma nova adaptacao epica.',
          release_date: '2026-07-17',
          runtime: 164,
          genres: ['Sci-Fi'],
          status: 'Released',
          vote_average: 7.3,
          poster_image: 'https://image.tmdb.org/t/p/w780/poster.jpg',
          backdrop_image: 'https://image.tmdb.org/t/p/w1280/backdrop.jpg',
          media: { backdrops: [], posters: [], videos: [] },
          cast: [],
          directors: [],
          trailer: null,
          watch_providers: { link: null, categories: [] },
        })
      }

      if (url === 'http://localhost:8000/api/movies/popular?page=1') {
        return jsonResponse({
          results: [],
          pagination: { page: 1, page_size: 15, has_next: false },
        })
      }

      return Promise.reject(new Error(`URL inesperada: ${url}`))
    })

    const movieView = renderApp('/movie/101')

    fireEvent.click(await screen.findByRole('button', { name: /salvar nos favoritos/i }))

    expect(await screen.findByRole('button', { name: /remover dos favoritos/i })).toBeInTheDocument()

    movieView.unmount()
    renderApp('/favorites')

    expect(await screen.findByText(/the odyssey/i)).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /remover/i })).toBeInTheDocument()
  })
})
