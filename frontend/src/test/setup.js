import '@testing-library/jest-dom'

beforeEach(() => {
  globalThis.__MOVIE_ATLAS_DISABLE_AUTH_BOOTSTRAP__ = true
})

afterEach(() => {
  delete globalThis.__MOVIE_ATLAS_DISABLE_AUTH_BOOTSTRAP__
})
