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
          path="/actors"
          element={
            <PeopleListingPage
              title="Atores"
              eyebrow="Atores"
              description="Lista real de atores populares integrada ao backend."
              fetchPeople={api.getPopularActors}
              errorMessageFallback="Nao foi possivel carregar os atores."
            />
          }
        />
        <Route
          path="/directors"
          element={
            <PeopleListingPage
              title="Diretores"
              eyebrow="Diretores"
              description="Lista real de diretores populares integrada ao backend."
              fetchPeople={api.getPopularDirectors}
              errorMessageFallback="Nao foi possivel carregar os diretores."
            />
          }
        />
        <Route path="/people" element={<Navigate to="/actors" replace />} />
        <Route path="/categories" element={<Navigate to="/movies" replace />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/upcoming" element={<UpcomingPage />} />
        <Route path="/movie/:id" element={<MovieDetailsPage />} />
        <Route path="/person/:id" element={<PersonPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
