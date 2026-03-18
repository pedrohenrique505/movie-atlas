import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import App from './App'

describe('App routes', () => {
  it('renders the home page', async () => {
    global.fetch = vi.fn((url) => {
      const payloads = {
        'http://localhost:8000/api/movies/trending': {
          results: [
            {
              id: '100',
              title: 'Trending One',
              release_date: '2026-03-19',
              status: 'trending',
              synopsis: '...',
              poster_image: 'https://image.tmdb.org/t/p/w780/trending-one.jpg',
              has_trailer: false,
            },
          ],
        },
        'http://localhost:8000/api/movies/now-playing': {
          results: [
            {
              id: '200',
              title: 'Now Playing One',
              release_date: '2026-03-20',
              status: 'now_playing',
              synopsis: '...',
              poster_image: null,
              has_trailer: false,
            },
          ],
        },
        'http://localhost:8000/api/movies/upcoming': {
          results: [
            {
              id: '300',
              title: 'Upcoming One',
              release_date: '2026-03-21',
              status: 'upcoming',
              synopsis: '...',
              poster_image: 'https://image.tmdb.org/t/p/w780/upcoming-one.jpg',
              has_trailer: false,
            },
          ],
        },
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(payloads[url]),
      })
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', {
        name: /descubra filmes em tendencia, em cartaz e os proximos lancamentos/i,
      }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /^home$/i })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /movie atlas/i })).toHaveAttribute('href', '/')
    expect(await screen.findByText(/trending one/i)).toBeInTheDocument()
    expect(await screen.findByText(/now playing one/i)).toBeInTheDocument()
    expect(await screen.findByText(/upcoming one/i)).toBeInTheDocument()
    expect(await screen.findByAltText(/poster de trending one/i)).toBeInTheDocument()
    expect(await screen.findByText(/^NP$/i)).toBeInTheDocument()
    expect(await screen.findByText(/data prevista de estreia: 2026-03-21/i)).toBeInTheDocument()
  })

  it('renders the upcoming page', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            results: [
              {
                id: '687163',
                title: 'Devoradores de Estrelas',
                release_date: '2026-03-19',
                status: 'upcoming',
                synopsis: '...',
                poster_image: null,
                has_trailer: false,
              },
            ],
          }),
      }),
    )

    render(
      <MemoryRouter initialEntries={['/upcoming']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      screen.getByRole('heading', {
        name: /proximos lancamentos/i,
      }),
    ).toBeInTheDocument()
    expect(await screen.findByText(/devoradores de estrelas/i)).toBeInTheDocument()
    expect(await screen.findByText(/data prevista de estreia: 2026-03-19/i)).toBeInTheDocument()
  })

  it('renders the movie details page', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            id: '101',
            title: 'The Odyssey',
            synopsis: 'Uma nova adaptacao epica.',
            release_date: '2026-07-17',
            runtime: 164,
            genres: ['Sci-Fi', 'Adventure'],
            status: 'Released',
            vote_average: 7.3,
            poster_image: 'https://image.tmdb.org/t/p/w780/poster.jpg',
            backdrop_image: 'https://image.tmdb.org/t/p/w1280/backdrop.jpg',
            images: ['https://image.tmdb.org/t/p/w780/img-1.jpg'],
            cast: [
              {
                id: '501',
                name: 'Matt Damon',
                character: 'Ryland Grace',
                profile_image: 'https://image.tmdb.org/t/p/w300/cast-1.jpg',
              },
            ],
            directors: [
              {
                id: '777',
                name: 'Christopher Nolan',
                department: 'Directing',
                profile_image: 'https://image.tmdb.org/t/p/w300/director.jpg',
              },
            ],
            trailer: {
              name: 'Trailer oficial',
              youtube_key: 'trailer123',
              embed_url: 'https://www.youtube.com/embed/trailer123',
            },
          }),
      }),
    )

    render(
      <MemoryRouter initialEntries={['/movie/101']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      await screen.findByRole('heading', {
        name: /the odyssey/i,
      }),
    ).toBeInTheDocument()
    expect(await screen.findByText(/elenco/i)).toBeInTheDocument()
    expect(await screen.findByText(/matt damon/i)).toBeInTheDocument()
    expect(await screen.findByText(/christopher nolan/i)).toBeInTheDocument()
    expect(await screen.findByText(/assista o trailer/i)).toBeInTheDocument()
    expect(screen.queryByText(/nota 7.3/i)).not.toBeInTheDocument()
  })

  it('renders the movies page with api content', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
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
          }),
      }),
    )

    render(
      <MemoryRouter initialEntries={['/movies']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      await screen.findByRole('heading', {
        name: /filmes populares/i,
      }),
    ).toBeInTheDocument()
    expect(await screen.findByText(/filme popular/i)).toBeInTheDocument()
  })

  it('renders the tv shows page with api content', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
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
          }),
      }),
    )

    render(
      <MemoryRouter initialEntries={['/tv-shows']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      await screen.findByRole('heading', {
        name: /shows de tv populares/i,
      }),
    ).toBeInTheDocument()
    expect(await screen.findByText(/serie popular/i)).toBeInTheDocument()
  })

  it('redirects removed routes to the people page', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            results: [
              {
                id: '111',
                name: 'Person Example',
                known_for_department: 'Acting',
                profile_image: 'https://image.tmdb.org/t/p/w300/person.jpg',
                known_for_titles: ['Film A'],
              },
            ],
          }),
      }),
    )

    render(
      <MemoryRouter initialEntries={['/directors']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      await screen.findByRole('heading', {
        name: /pessoas/i,
      }),
    ).toBeInTheDocument()
    expect(await screen.findByText(/person example/i)).toBeInTheDocument()
  })

  it('renders the people page with api content', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            results: [
              {
                id: '111',
                name: 'Person Example',
                known_for_department: 'Acting',
                profile_image: 'https://image.tmdb.org/t/p/w300/person.jpg',
                known_for_titles: ['Film A'],
              },
            ],
          }),
      }),
    )

    render(
      <MemoryRouter initialEntries={['/people']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      await screen.findByRole('heading', {
        name: /pessoas/i,
      }),
    ).toBeInTheDocument()
    expect(await screen.findByText(/person example/i)).toBeInTheDocument()
  })

  it('renders the person details page', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            id: '777',
            name: 'Christopher Nolan',
            biography: 'Biografia resumida.',
            known_for_department: 'Directing',
            birthday: '1970-07-30',
            place_of_birth: 'London, England, UK',
            profile_image: 'https://image.tmdb.org/t/p/w780/person.jpg',
            projects: [
              {
                id: '101',
                title: 'Inception',
                release_date: '2010-07-16',
                media_type: 'movie',
                credit: 'Director',
              },
            ],
          }),
      }),
    )

    render(
      <MemoryRouter initialEntries={['/person/777']}>
        <App />
      </MemoryRouter>,
    )

    expect(
      await screen.findByRole('heading', {
        name: /christopher nolan/i,
      }),
    ).toBeInTheDocument()
    expect(await screen.findByText(/directing/i)).toBeInTheDocument()
    expect(await screen.findByText(/inception/i)).toBeInTheDocument()
  })

  it('opens the trailer in a modal on the movie page', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            id: '101',
            title: 'The Odyssey',
            synopsis: 'Uma nova adaptacao epica.',
            release_date: '2026-07-17',
            runtime: 164,
            genres: ['Sci-Fi', 'Adventure'],
            status: 'Released',
            poster_image: 'https://image.tmdb.org/t/p/w780/poster.jpg',
            backdrop_image: 'https://image.tmdb.org/t/p/w1280/backdrop.jpg',
            images: [],
            cast: [],
            directors: [
              {
                id: '777',
                name: 'Christopher Nolan',
                department: 'Directing',
                profile_image: 'https://image.tmdb.org/t/p/w300/director.jpg',
              },
            ],
            trailer: {
              name: 'Trailer oficial',
              youtube_key: 'trailer123',
              embed_url: 'https://www.youtube.com/embed/trailer123',
            },
          }),
      }),
    )

    render(
      <MemoryRouter initialEntries={['/movie/101']}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.click(await screen.findByRole('button', { name: /assista o trailer/i }))

    expect(await screen.findByRole('dialog', { name: /trailer oficial/i })).toBeInTheDocument()
  })
})
