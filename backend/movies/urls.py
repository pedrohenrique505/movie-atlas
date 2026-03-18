from django.urls import path

from .views import (
    MovieDetailsView,
    MovieCategoriesView,
    NowPlayingMoviesView,
    PersonDetailsView,
    SearchMoviesView,
    PopularActorsView,
    PopularDirectorsView,
    PopularMoviesView,
    PopularTvShowsView,
    TrendingMoviesView,
    UpcomingMoviesView,
)

urlpatterns = [
    path('search', SearchMoviesView.as_view(), name='movies-search'),
    path('movies/categories', MovieCategoriesView.as_view(), name='movies-categories'),
    path('movies/trending', TrendingMoviesView.as_view(), name='movies-trending'),
    path('movies/popular', PopularMoviesView.as_view(), name='movies-popular'),
    path('movies/now-playing', NowPlayingMoviesView.as_view(), name='movies-now-playing'),
    path('movies/upcoming', UpcomingMoviesView.as_view(), name='movies-upcoming'),
    path('movies/<str:movie_id>', MovieDetailsView.as_view(), name='movie-details'),
    path('tv-shows/popular', PopularTvShowsView.as_view(), name='tv-shows-popular'),
    path('people/actors', PopularActorsView.as_view(), name='people-actors'),
    path('people/directors', PopularDirectorsView.as_view(), name='people-directors'),
    path('people/<str:person_id>', PersonDetailsView.as_view(), name='person-details'),
]
