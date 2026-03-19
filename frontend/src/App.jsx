import { Navigate, Route, Routes } from 'react-router-dom'

import './App.css'
import { AppLayout } from './layout/AppLayout'
import { HomePage } from './pages/HomePage'
import { MovieDetailsPage } from './pages/MovieDetailsPage'
import { MoviesPage } from './pages/MoviesPage'
import { PeopleListingPage } from './pages/PeopleListingPage'
import { PersonPage } from './pages/PersonPage'
import { SearchPage } from './pages/SearchPage'
import { TvShowsPage } from './pages/TvShowsPage'
import { TvShowDetailsPage } from './pages/TvShowDetailsPage'
import { UpcomingPage } from './pages/UpcomingPage'
import { api } from './services/api'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/movies" element={<MoviesPage />} />
        <Route path="/tv-shows" element={<TvShowsPage />} />
        <Route
          path="/people"
          element={
            <PeopleListingPage
              title="Pessoas"
              fetchPeople={api.getPopularActors}
              errorMessageFallback="Não foi possível carregar as pessoas."
            />
          }
        />
        <Route path="/actors" element={<Navigate to="/people" replace />} />
        <Route
          path="/directors"
          element={
            <PeopleListingPage
              title="Diretores"
              fetchPeople={api.getPopularDirectors}
              errorMessageFallback="Não foi possível carregar os diretores."
            />
          }
        />
        <Route path="/categories" element={<Navigate to="/movies" replace />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/upcoming" element={<UpcomingPage />} />
        <Route path="/movie/:id" element={<MovieDetailsPage />} />
        <Route path="/tv-show/:id" element={<TvShowDetailsPage />} />
        <Route path="/person/:id" element={<PersonPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
