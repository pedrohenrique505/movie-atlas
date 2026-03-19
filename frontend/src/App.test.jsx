import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import App from './App'

describe('App routes', () => {
  it('renders the home page', async () => {
    document.title = 'Movie Atlas'
    global.fetch = vi.fn((url) => {
      const payloads = {
        'http://localhost:8000/api/movies/trending?page=1': {
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
          pagination: { page: 1, page_size: 15, has_next: true },
        },
        'http://localhost:8000/api/movies/now-playing?page=1': {
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
          pagination: { page: 1, page_size: 15, has_next: true },
        },
        'http://localhost:8000/api/movies/upcoming?page=1': {
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
          pagination: { page: 1, page_size: 15, has_next: true },
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
        name: /descubra filmes em alta, em cartaz e os próximos lançamentos/i,
      }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /^home$/i })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /movie atlas/i })).toHaveAttribute('href', '/')
    expect(await screen.findAllByRole('heading', { name: /em cartaz/i })).toHaveLength(2)
    expect(await screen.findAllByRole('heading', { name: /próximos lançamentos/i })).toHaveLength(2)
    expect((await screen.findByText(/now playing one/i)).closest('a')).toHaveAttribute(
      'href',
      '/movie/200',
    )
    expect(await screen.findByRole('link', { name: /poster de upcoming one/i })).toHaveAttribute(
      'href',
      '/movie/300',
    )
    expect(await screen.findByText(/^NP$/i)).toBeInTheDocument()
    expect(await screen.findByText(/data prevista de estreia: 21\/03\/2026/i)).toBeInTheDocument()
    expect(document.title).toBe('Movie Atlas')
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
            pagination: { page: 1, page_size: 15, has_next: false },
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
        name: /próximos lançamentos/i,
      }),
    ).toBeInTheDocument()
    expect(await screen.findByText(/devoradores de estrelas/i)).toBeInTheDocument()
    expect(await screen.findByText(/data prevista de estreia: 19\/03\/2026/i)).toBeInTheDocument()
    expect(document.title).toBe('Próximos lançamentos | Movie Atlas')
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
            media: {
              backdrops: [
                {
                  preview_image: 'https://image.tmdb.org/t/p/w1280/img-1.jpg',
                  full_image: 'https://image.tmdb.org/t/p/original/img-1.jpg',
                },
              ],
              posters: [
                {
                  preview_image: 'https://image.tmdb.org/t/p/w780/poster-extra.jpg',
                  full_image: 'https://image.tmdb.org/t/p/original/poster-extra.jpg',
                },
              ],
              videos: [
                {
                  name: 'Trailer oficial',
                  type: 'Trailer',
                  youtube_key: 'trailer123',
                  embed_url: 'https://www.youtube.com/embed/trailer123',
                  thumbnail_image: 'https://img.youtube.com/vi/trailer123/hqdefault.jpg',
                },
              ],
            },
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
            watch_providers: {
              link: 'https://www.themoviedb.org/movie/101/watch',
              categories: [
                {
                  key: 'flatrate',
                  label: 'Streaming',
                  providers: [
                    {
                      id: '8',
                      name: 'Netflix',
                      logo_image: 'https://image.tmdb.org/t/p/w300/netflix.jpg',
                      link: 'https://www.themoviedb.org/movie/101/watch',
                    },
                  ],
                },
              ],
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
    expect(await screen.findByRole('button', { name: /assista ao trailer/i })).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: /mídia/i })).toBeInTheDocument()
    expect(
      await screen.findByRole('link', { name: /onde posso assistir\?/i }),
    ).toHaveAttribute('href', 'https://www.themoviedb.org/movie/101/watch')
    expect(screen.queryByText(/nota 7.3/i)).not.toBeInTheDocument()
    expect(document.title).toBe('The Odyssey | Movie Atlas')
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
            pagination: { page: 1, page_size: 15, has_next: false },
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
    expect(document.title).toBe('Filmes | Movie Atlas')
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
                title: 'Série Popular',
                release_date: '2025-10-01',
                status: 'tv_show',
                synopsis: 'Série em destaque.',
                poster_image: 'https://image.tmdb.org/t/p/w780/serie.jpg',
                has_trailer: false,
              },
            ],
            pagination: { page: 1, page_size: 15, has_next: false },
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
        name: /séries populares/i,
      }),
    ).toBeInTheDocument()
    expect(await screen.findByText(/série popular/i)).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: /poster de série popular/i })).toHaveAttribute(
      'href',
      '/tv-show/801',
    )
    expect(document.title).toBe('Séries | Movie Atlas')
  })

  it('renders the tv show details page', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            id: '85552',
            title: 'Silo',
            synopsis: 'Uma série distópica.',
            release_date: '2023-05-04',
            runtime: 49,
            genres: ['Drama', 'Sci-Fi'],
            status: 'Série em andamento',
            vote_average: 8.2,
            poster_image: 'https://image.tmdb.org/t/p/w780/tv-poster.jpg',
            backdrop_image: 'https://image.tmdb.org/t/p/w1280/tv-backdrop.jpg',
            images: ['https://image.tmdb.org/t/p/w780/tv-img-1.jpg'],
            media: {
              backdrops: [
                {
                  preview_image: 'https://image.tmdb.org/t/p/w1280/tv-img-1.jpg',
                  full_image: 'https://image.tmdb.org/t/p/original/tv-img-1.jpg',
                },
              ],
              posters: [],
              videos: [
                {
                  name: 'Trailer oficial',
                  type: 'Trailer',
                  youtube_key: 'silo123',
                  embed_url: 'https://www.youtube.com/embed/silo123',
                  thumbnail_image: 'https://img.youtube.com/vi/silo123/hqdefault.jpg',
                },
              ],
            },
            cast: [
              {
                id: '501',
                name: 'Rebecca Ferguson',
                character: 'Juliette',
                profile_image: 'https://image.tmdb.org/t/p/w300/tv-cast.jpg',
              },
            ],
            creators: [
              {
                id: '123',
                name: 'Graham Yost',
                department: 'Writing',
                profile_image: 'https://image.tmdb.org/t/p/w300/creator.jpg',
              },
            ],
            trailer: {
              name: 'Trailer oficial',
              youtube_key: 'silo123',
              embed_url: 'https://www.youtube.com/embed/silo123',
            },
            number_of_seasons: 2,
            number_of_episodes: 20,
            production_companies: ['AMC Studios'],
            watch_providers: {
              link: 'https://www.themoviedb.org/tv/85552/watch',
              categories: [],
            },
          }),
      }),
    )

    render(
      <MemoryRouter initialEntries={['/tv-show/85552']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: /silo/i })).toBeInTheDocument()
    expect(await screen.findByText(/2 temporadas/i)).toBeInTheDocument()
    expect(await screen.findByText(/20 episódios/i)).toBeInTheDocument()
    expect(await screen.findByText(/graham yost/i)).toBeInTheDocument()
    expect(await screen.findByText(/amc studios/i)).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: /mídia/i })).toBeInTheDocument()
    expect(
      await screen.findByRole('link', { name: /onde posso assistir\?/i }),
    ).toHaveAttribute('href', 'https://www.themoviedb.org/tv/85552/watch')
    expect(document.title).toBe('Silo | Movie Atlas')
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
            pagination: { page: 1, page_size: 15, has_next: false },
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
        name: /diretores/i,
      }),
    ).toBeInTheDocument()
    expect(await screen.findByText(/person example/i)).toBeInTheDocument()
    expect(document.title).toBe('Diretores | Movie Atlas')
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
            pagination: { page: 1, page_size: 15, has_next: false },
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
    expect(document.title).toBe('Pessoas | Movie Atlas')
  })

  it('hides the header on scroll down and shows it on scroll up', async () => {
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
      configurable: true,
    })

    global.fetch = vi.fn((url) => {
      const payloads = {
        'http://localhost:8000/api/movies/trending?page=1': {
          results: [],
          pagination: { page: 1, page_size: 15, has_next: false },
        },
        'http://localhost:8000/api/movies/now-playing?page=1': {
          results: [],
          pagination: { page: 1, page_size: 15, has_next: false },
        },
        'http://localhost:8000/api/movies/upcoming?page=1': {
          results: [],
          pagination: { page: 1, page_size: 15, has_next: false },
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

    const header = screen.getByRole('banner')

    expect(header).toHaveClass('topbar--visible')

    window.scrollY = 140
    fireEvent.scroll(window)

    await waitFor(() => {
      expect(header).toHaveClass('topbar--hidden')
    })

    window.scrollY = 20
    fireEvent.scroll(window)

    await waitFor(() => {
      expect(header).toHaveClass('topbar--visible')
    })
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
                poster_image: 'https://image.tmdb.org/t/p/w780/inception.jpg',
                credit: 'Director',
              },
            ],
            pagination: { page: 1, page_size: 15, has_next: false },
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
    expect(await screen.findByText(/direção/i)).toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: /obras/i })).toBeInTheDocument()
    expect(await screen.findByText(/inception/i)).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: /poster de inception/i })).toHaveAttribute(
      'href',
      '/movie/101',
    )
    expect(document.title).toBe('Christopher Nolan | Movie Atlas')
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
            media: {
              backdrops: [],
              posters: [],
              videos: [],
            },
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
            watch_providers: {
              link: null,
              categories: [],
            },
          }),
      }),
    )

    render(
      <MemoryRouter initialEntries={['/movie/101']}>
        <App />
      </MemoryRouter>,
    )

    fireEvent.click(await screen.findByRole('button', { name: /assista ao trailer/i }))

    expect(await screen.findByRole('dialog', { name: /trailer oficial/i })).toBeInTheDocument()
  })

  it('searches movies and renders results', async () => {
    document.title = 'Movie Atlas'
    global.fetch = vi.fn((url) => {
      if (url === 'http://localhost:8000/api/search?q=blade') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              results: [
                {
                  id: '909',
                  media_type: 'movie',
                  title: 'Blade Runner',
                  release_date: '1982-06-25',
                  status: 'search_result',
                  synopsis: 'Neo-noir de ficcao cientifica.',
                  poster_image: 'https://image.tmdb.org/t/p/w780/blade-runner.jpg',
                  has_trailer: false,
                },
                {
                  id: '777',
                  media_type: 'person',
                  name: 'Harrison Ford',
                  known_for_department: 'Acting',
                  profile_image: 'https://image.tmdb.org/t/p/w300/harrison-ford.jpg',
                  known_for_titles: ['Blade Runner', 'Witness'],
                },
              ],
              pagination: { page: 1, page_size: 15, has_next: false },
            }),
        })
      }

      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ results: [] }),
      })
    })

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('searchbox', { name: /buscar/i })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /abrir busca/i }))

    const searchbox = await screen.findByRole('searchbox', { name: /buscar/i })

    fireEvent.change(searchbox, {
      target: { value: 'blade' },
    })
    fireEvent.click(screen.getByRole('button', { name: /^buscar$/i }))

    expect(await screen.findByRole('heading', { name: /resultados para "blade"/i })).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: /poster de blade runner/i })).toHaveAttribute(
      'href',
      '/movie/909',
    )
    expect(await screen.findByText(/harrison ford/i)).toBeInTheDocument()
    expect(document.title).toBe('Busca: blade | Movie Atlas')
  })

  it('loads more movies without repeating previous results', async () => {
    global.fetch = vi.fn((url) => {
      if (url === 'http://localhost:8000/api/movies/popular?page=1') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              results: [
                {
                  id: '901',
                  title: 'Filme Popular 1',
                  release_date: '2026-05-22',
                  status: 'popular',
                  synopsis: 'Filme popular do momento.',
                  poster_image: 'https://image.tmdb.org/t/p/w780/popular-1.jpg',
                  has_trailer: false,
                },
              ],
              pagination: { page: 1, page_size: 15, has_next: true },
            }),
        })
      }

      if (url === 'http://localhost:8000/api/movies/popular?page=2') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              results: [
                {
                  id: '902',
                  title: 'Filme Popular 2',
                  release_date: '2026-05-23',
                  status: 'popular',
                  synopsis: 'Outro filme popular.',
                  poster_image: 'https://image.tmdb.org/t/p/w780/popular-2.jpg',
                  has_trailer: false,
                },
              ],
              pagination: { page: 2, page_size: 15, has_next: false },
            }),
        })
      }

      return Promise.reject(new Error(`URL inesperada: ${url}`))
    })

    render(
      <MemoryRouter initialEntries={['/movies']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByText(/filme popular 1/i)).toBeInTheDocument()

    fireEvent.click(await screen.findByRole('button', { name: /carregar mais/i }))

    expect(await screen.findByText(/filme popular 2/i)).toBeInTheDocument()
    expect(screen.getByText(/filme popular 1/i)).toBeInTheDocument()
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/movies/popular?page=2',
      expect.any(Object),
    )
  })

  it('loads more people without repeating previous results', async () => {
    global.fetch = vi.fn((url) => {
      if (url === 'http://localhost:8000/api/people/actors?page=1') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              results: [
                {
                  id: '111',
                  name: 'Pessoa 1',
                  known_for_department: 'Acting',
                  profile_image: 'https://image.tmdb.org/t/p/w300/person-1.jpg',
                  known_for_titles: ['Filme A'],
                },
              ],
              pagination: { page: 1, page_size: 15, has_next: true },
            }),
        })
      }

      if (url === 'http://localhost:8000/api/people/actors?page=2') {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              results: [
                {
                  id: '112',
                  name: 'Pessoa 2',
                  known_for_department: 'Acting',
                  profile_image: 'https://image.tmdb.org/t/p/w300/person-2.jpg',
                  known_for_titles: ['Filme B'],
                },
              ],
              pagination: { page: 2, page_size: 15, has_next: false },
            }),
        })
      }

      return Promise.reject(new Error(`URL inesperada: ${url}`))
    })

    render(
      <MemoryRouter initialEntries={['/actors']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByText(/pessoa 1/i)).toBeInTheDocument()

    fireEvent.click(await screen.findByRole('button', { name: /carregar mais/i }))

    expect(await screen.findByText(/pessoa 2/i)).toBeInTheDocument()
    expect(screen.getByText(/pessoa 1/i)).toBeInTheDocument()
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/people/actors?page=2',
      expect.any(Object),
    )
  })
})
