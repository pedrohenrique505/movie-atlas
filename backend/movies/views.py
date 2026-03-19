from drf_spectacular.utils import OpenApiExample, OpenApiResponse, extend_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import MovieServiceError, TMDbMovieService


def build_movie_list_example(status='listed'):
    return {
        'results': [
            {
                'id': '980489',
                'title': 'Gran Turismo 2',
                'release_date': '2026-06-24',
                'status': status,
                'synopsis': 'Exemplo de retorno normalizado da API externa.',
                'poster_image': 'https://image.tmdb.org/t/p/w780/example-poster.jpg',
                'has_trailer': False,
            }
        ],
        'pagination': {
            'page': 1,
            'page_size': 15,
            'has_next': True,
        },
    }


def build_upcoming_movies_example():
    return build_movie_list_example(status='upcoming')


def build_search_movies_example():
    return {
        'results': [
            {
                'id': '980489',
                'media_type': 'movie',
                'title': 'Gran Turismo 2',
                'release_date': '2026-06-24',
                'status': 'search_result',
                'synopsis': 'Exemplo de filme retornado na busca.',
                'poster_image': 'https://image.tmdb.org/t/p/w780/example-poster.jpg',
                'has_trailer': False,
            },
            {
                'id': '42',
                'media_type': 'person',
                'name': 'Pessoa Exemplo',
                'known_for_department': 'Acting',
                'profile_image': 'https://image.tmdb.org/t/p/w300/example-person.jpg',
                'known_for_titles': ['Obra Exemplo', 'Outra Obra'],
            },
        ],
        'pagination': {
            'page': 1,
            'page_size': 15,
            'has_next': False,
        },
    }


def build_people_list_example(department='Acting'):
    return {
        'results': [
            {
                'id': '42',
                'name': 'Pessoa Exemplo',
                'known_for_department': department,
                'profile_image': 'https://image.tmdb.org/t/p/w300/example-person.jpg',
                'known_for_titles': ['Obra Exemplo', 'Outra Obra'],
            }
        ],
        'pagination': {
            'page': 1,
            'page_size': 15,
            'has_next': True,
        },
    }


def build_categories_example():
    return {
        'results': [
            {'id': '28', 'name': 'Acao'},
            {'id': '18', 'name': 'Drama'},
        ]
    }


def get_page_number(request):
    try:
        page = int(request.query_params.get('page', 1))
    except (TypeError, ValueError):
        return 1

    return page if page > 0 else 1


def build_movie_details_example():
    return {
        'id': '980489',
        'title': 'Gran Turismo 2',
        'synopsis': 'Exemplo de detalhes de um filme.',
        'release_date': '2026-06-24',
        'runtime': 118,
        'genres': ['Acao', 'Drama'],
        'status': 'Released',
        'vote_average': 7.4,
        'poster_image': 'https://image.tmdb.org/t/p/w780/example-poster.jpg',
        'backdrop_image': 'https://image.tmdb.org/t/p/w1280/example-backdrop.jpg',
        'images': [
            'https://image.tmdb.org/t/p/w780/example-image-1.jpg',
            'https://image.tmdb.org/t/p/w780/example-image-2.jpg',
        ],
        'media': {
            'backdrops': [
                {
                    'preview_image': 'https://image.tmdb.org/t/p/w1280/example-backdrop-1.jpg',
                    'full_image': 'https://image.tmdb.org/t/p/original/example-backdrop-1.jpg',
                }
            ],
            'posters': [
                {
                    'preview_image': 'https://image.tmdb.org/t/p/w780/example-poster-1.jpg',
                    'full_image': 'https://image.tmdb.org/t/p/original/example-poster-1.jpg',
                }
            ],
            'videos': [
                {
                    'name': 'Trailer oficial',
                    'type': 'Trailer',
                    'youtube_key': 'abc123',
                    'embed_url': 'https://www.youtube.com/embed/abc123',
                    'thumbnail_image': 'https://img.youtube.com/vi/abc123/hqdefault.jpg',
                }
            ],
        },
        'cast': [
            {
                'id': '1',
                'name': 'Ator Exemplo',
                'character': 'Piloto',
                'profile_image': 'https://image.tmdb.org/t/p/w300/example-cast.jpg',
            }
        ],
        'directors': [
            {
                'id': '2',
                'name': 'Diretora Exemplo',
                'department': 'Directing',
                'profile_image': 'https://image.tmdb.org/t/p/w300/example-director.jpg',
            }
        ],
        'trailer': {
            'name': 'Trailer oficial',
            'youtube_key': 'abc123',
            'embed_url': 'https://www.youtube.com/embed/abc123',
        },
        'watch_providers': {
            'link': 'https://www.themoviedb.org/movie/980489/watch',
            'categories': [
                {
                    'key': 'flatrate',
                    'label': 'Streaming',
                    'providers': [
                        {
                            'id': '8',
                            'name': 'Netflix',
                            'logo_image': 'https://image.tmdb.org/t/p/w300/netflix.jpg',
                            'link': 'https://www.themoviedb.org/movie/980489/watch',
                        }
                    ],
                }
            ],
        },
    }


def build_tv_show_details_example():
    return {
        'id': '85552',
        'title': 'Silo',
        'synopsis': 'Exemplo de detalhes de uma serie.',
        'release_date': '2023-05-04',
        'runtime': 49,
        'genres': ['Drama', 'Sci-Fi'],
        'status': 'Serie em andamento',
        'vote_average': 8.2,
        'poster_image': 'https://image.tmdb.org/t/p/w780/example-tv-poster.jpg',
        'backdrop_image': 'https://image.tmdb.org/t/p/w1280/example-tv-backdrop.jpg',
        'images': [
            'https://image.tmdb.org/t/p/w780/example-tv-image-1.jpg',
            'https://image.tmdb.org/t/p/w780/example-tv-image-2.jpg',
        ],
        'media': {
            'backdrops': [
                {
                    'preview_image': 'https://image.tmdb.org/t/p/w1280/example-tv-backdrop-1.jpg',
                    'full_image': 'https://image.tmdb.org/t/p/original/example-tv-backdrop-1.jpg',
                }
            ],
            'posters': [
                {
                    'preview_image': 'https://image.tmdb.org/t/p/w780/example-tv-poster-1.jpg',
                    'full_image': 'https://image.tmdb.org/t/p/original/example-tv-poster-1.jpg',
                }
            ],
            'videos': [
                {
                    'name': 'Trailer oficial',
                    'type': 'Trailer',
                    'youtube_key': 'def456',
                    'embed_url': 'https://www.youtube.com/embed/def456',
                    'thumbnail_image': 'https://img.youtube.com/vi/def456/hqdefault.jpg',
                }
            ],
        },
        'cast': [
            {
                'id': '10',
                'name': 'Atriz Exemplo',
                'character': 'Juliette',
                'profile_image': 'https://image.tmdb.org/t/p/w300/example-tv-cast.jpg',
            }
        ],
        'creators': [
            {
                'id': '11',
                'name': 'Criador Exemplo',
                'department': 'Creator',
                'profile_image': 'https://image.tmdb.org/t/p/w300/example-tv-creator.jpg',
            }
        ],
        'trailer': {
            'name': 'Trailer oficial',
            'youtube_key': 'def456',
            'embed_url': 'https://www.youtube.com/embed/def456',
        },
        'number_of_seasons': 2,
        'number_of_episodes': 20,
        'production_companies': ['AMC Studios'],
        'watch_providers': {
            'link': 'https://www.themoviedb.org/tv/85552/watch',
            'categories': [
                {
                    'key': 'flatrate',
                    'label': 'Streaming',
                    'providers': [
                        {
                            'id': '8',
                            'name': 'Netflix',
                            'logo_image': 'https://image.tmdb.org/t/p/w300/netflix.jpg',
                            'link': 'https://www.themoviedb.org/tv/85552/watch',
                        }
                    ],
                }
            ],
        },
    }


def build_person_details_example():
    return {
        'id': '2',
        'name': 'Diretora Exemplo',
        'biography': 'Exemplo de biografia retornada pela API externa.',
        'known_for_department': 'Directing',
        'birthday': '1980-06-15',
        'place_of_birth': 'Sao Paulo, Brasil',
        'profile_image': 'https://image.tmdb.org/t/p/w780/example-person.jpg',
        'projects': [
            {
                'id': '980489',
                'title': 'Gran Turismo 2',
                'release_date': '2026-06-24',
                'media_type': 'movie',
                'poster_image': 'https://image.tmdb.org/t/p/w780/example-project-poster.jpg',
                'credit': 'Director',
            },
            {
                'id': '77',
                'title': 'Serie Exemplo',
                'release_date': '2025-04-10',
                'media_type': 'tv',
                'poster_image': 'https://image.tmdb.org/t/p/w780/example-tv-poster.jpg',
                'credit': 'Executive Producer',
            },
        ],
    }


class UpcomingMoviesView(APIView):
    @extend_schema(
        operation_id='list_upcoming_movies',
        summary='Lista proximos lancamentos',
        description='Consulta uma API externa de filmes e normaliza a resposta para o frontend.',
        responses={
            200: OpenApiResponse(
                response={
                    'type': 'object',
                    'properties': {
                        'results': {
                            'type': 'array',
                            'items': {
                                'type': 'object',
                                'properties': {
                                    'id': {'type': 'string'},
                                    'media_type': {'type': 'string'},
                                    'title': {'type': 'string', 'nullable': True},
                                    'name': {'type': 'string', 'nullable': True},
                                    'release_date': {'type': 'string', 'format': 'date', 'nullable': True},
                                    'status': {'type': 'string', 'nullable': True},
                                    'synopsis': {'type': 'string', 'nullable': True},
                                    'poster_image': {'type': 'string', 'nullable': True},
                                    'has_trailer': {'type': 'boolean', 'nullable': True},
                                    'known_for_department': {'type': 'string', 'nullable': True},
                                    'profile_image': {'type': 'string', 'nullable': True},
                                    'known_for_titles': {
                                        'type': 'array',
                                        'items': {'type': 'string'},
                                    },
                                },
                            },
                        },
                        'pagination': {
                            'type': 'object',
                            'properties': {
                                'page': {'type': 'integer'},
                                'page_size': {'type': 'integer'},
                                'has_next': {'type': 'boolean'},
                            },
                        },
                    },
                },
                examples=[
                    OpenApiExample(
                        'Upcoming movies response',
                        value=build_upcoming_movies_example(),
                    )
                ],
            ),
            503: OpenApiResponse(description='Falha de configuracao ou integracao com a API externa.'),
        },
    )
    def get(self, request):
        service = TMDbMovieService()
        page = get_page_number(request)

        try:
            payload = service.get_upcoming_movies(page=page)
        except MovieServiceError as exc:
            return Response(
                {'detail': str(exc)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(payload)


class SearchMoviesView(APIView):
    @extend_schema(
        operation_id='search_movies',
        summary='Busca filmes por titulo',
        description='Consulta a API externa para buscar filmes por titulo.',
        responses={
            200: OpenApiResponse(
                response={
                    'type': 'object',
                    'properties': {
                        'results': {
                            'type': 'array',
                            'items': {
                                'type': 'object',
                                'properties': {
                                    'id': {'type': 'string'},
                                    'title': {'type': 'string'},
                                    'release_date': {'type': 'string', 'format': 'date'},
                                    'status': {'type': 'string'},
                                    'synopsis': {'type': 'string'},
                                    'poster_image': {'type': 'string', 'nullable': True},
                                    'has_trailer': {'type': 'boolean'},
                                },
                            },
                        },
                        'pagination': {
                            'type': 'object',
                            'properties': {
                                'page': {'type': 'integer'},
                                'page_size': {'type': 'integer'},
                                'has_next': {'type': 'boolean'},
                            },
                        },
                    },
                },
                examples=[
                    OpenApiExample(
                        'Movie search response',
                        value=build_search_movies_example(),
                    )
                ],
            ),
            503: OpenApiResponse(description='Falha de configuracao ou integracao com a API externa.'),
        },
    )
    def get(self, request):
        service = TMDbMovieService()
        query = request.query_params.get('q', '')

        try:
            payload = service.search_movies(query)
        except MovieServiceError as exc:
            return Response(
                {'detail': str(exc)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(payload)


class TrendingMoviesView(APIView):
    @extend_schema(
        operation_id='list_trending_movies',
        summary='Lista filmes em tendencia',
        description='Consulta a API externa de filmes e retorna no maximo 15 resultados.',
        responses={
            200: OpenApiResponse(
                response={
                    'type': 'object',
                    'properties': {
                        'results': {
                            'type': 'array',
                            'items': {
                                'type': 'object',
                                'properties': {
                                    'id': {'type': 'string'},
                                    'title': {'type': 'string'},
                                    'release_date': {'type': 'string', 'format': 'date'},
                                    'status': {'type': 'string'},
                                    'synopsis': {'type': 'string'},
                                    'poster_image': {'type': 'string', 'nullable': True},
                                    'has_trailer': {'type': 'boolean'},
                                },
                            },
                        },
                        'pagination': {
                            'type': 'object',
                            'properties': {
                                'page': {'type': 'integer'},
                                'page_size': {'type': 'integer'},
                                'has_next': {'type': 'boolean'},
                            },
                        },
                    },
                },
                examples=[
                    OpenApiExample(
                        'Trending movies response',
                        value=build_movie_list_example(),
                    )
                ],
            ),
            503: OpenApiResponse(description='Falha de configuracao ou integracao com a API externa.'),
        },
    )
    def get(self, request):
        service = TMDbMovieService()
        page = get_page_number(request)

        try:
            payload = service.get_trending_movies(page=page)
        except MovieServiceError as exc:
            return Response(
                {'detail': str(exc)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(payload)


class PopularMoviesView(APIView):
    @extend_schema(
        operation_id='list_popular_movies',
        summary='Lista filmes populares',
        description='Consulta a API externa de filmes populares e retorna no maximo 15 resultados.',
        responses={
            200: OpenApiResponse(
                response={
                    'type': 'object',
                    'properties': {
                        'results': {
                            'type': 'array',
                            'items': {
                                'type': 'object',
                                'properties': {
                                    'id': {'type': 'string'},
                                    'title': {'type': 'string'},
                                    'release_date': {'type': 'string', 'format': 'date'},
                                    'status': {'type': 'string'},
                                    'synopsis': {'type': 'string'},
                                    'poster_image': {'type': 'string', 'nullable': True},
                                    'has_trailer': {'type': 'boolean'},
                                },
                            },
                        },
                        'pagination': {
                            'type': 'object',
                            'properties': {
                                'page': {'type': 'integer'},
                                'page_size': {'type': 'integer'},
                                'has_next': {'type': 'boolean'},
                            },
                        },
                    },
                },
                examples=[
                    OpenApiExample(
                        'Popular movies response',
                        value=build_movie_list_example(status='popular'),
                    )
                ],
            ),
            503: OpenApiResponse(description='Falha de configuracao ou integracao com a API externa.'),
        },
    )
    def get(self, request):
        service = TMDbMovieService()
        page = get_page_number(request)

        try:
            payload = service.get_popular_movies(page=page)
        except MovieServiceError as exc:
            return Response(
                {'detail': str(exc)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(payload)


class NowPlayingMoviesView(APIView):
    @extend_schema(
        operation_id='list_now_playing_movies',
        summary='Lista filmes em cartaz',
        description='Consulta a API externa de filmes e retorna no maximo 15 resultados.',
        responses={
            200: OpenApiResponse(
                response={
                    'type': 'object',
                    'properties': {
                        'results': {
                            'type': 'array',
                            'items': {
                                'type': 'object',
                                'properties': {
                                    'id': {'type': 'string'},
                                    'title': {'type': 'string'},
                                    'release_date': {'type': 'string', 'format': 'date'},
                                    'status': {'type': 'string'},
                                    'synopsis': {'type': 'string'},
                                    'poster_image': {'type': 'string', 'nullable': True},
                                    'has_trailer': {'type': 'boolean'},
                                },
                            },
                        },
                        'pagination': {
                            'type': 'object',
                            'properties': {
                                'page': {'type': 'integer'},
                                'page_size': {'type': 'integer'},
                                'has_next': {'type': 'boolean'},
                            },
                        },
                    },
                },
                examples=[
                    OpenApiExample(
                        'Now playing movies response',
                        value=build_movie_list_example(),
                    )
                ],
            ),
            503: OpenApiResponse(description='Falha de configuracao ou integracao com a API externa.'),
        },
    )
    def get(self, request):
        service = TMDbMovieService()
        page = get_page_number(request)

        try:
            payload = service.get_now_playing_movies(page=page)
        except MovieServiceError as exc:
            return Response(
                {'detail': str(exc)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(payload)


class PopularTvShowsView(APIView):
    @extend_schema(
        operation_id='list_popular_tv_shows',
        summary='Lista shows de TV populares',
        description='Consulta a API externa de TV e retorna no maximo 15 resultados.',
        responses={
            200: OpenApiResponse(
                response={
                    'type': 'object',
                    'properties': {
                        'results': {
                            'type': 'array',
                            'items': {
                                'type': 'object',
                                'properties': {
                                    'id': {'type': 'string'},
                                    'title': {'type': 'string'},
                                    'release_date': {'type': 'string', 'format': 'date'},
                                    'status': {'type': 'string'},
                                    'synopsis': {'type': 'string'},
                                    'poster_image': {'type': 'string', 'nullable': True},
                                    'has_trailer': {'type': 'boolean'},
                                },
                            },
                        },
                        'pagination': {
                            'type': 'object',
                            'properties': {
                                'page': {'type': 'integer'},
                                'page_size': {'type': 'integer'},
                                'has_next': {'type': 'boolean'},
                            },
                        },
                    },
                },
                examples=[
                    OpenApiExample(
                        'Popular TV shows response',
                        value=build_movie_list_example(status='tv_show'),
                    )
                ],
            ),
            503: OpenApiResponse(description='Falha de configuracao ou integracao com a API externa.'),
        },
    )
    def get(self, request):
        service = TMDbMovieService()
        page = get_page_number(request)

        try:
            payload = service.get_popular_tv_shows(page=page)
        except MovieServiceError as exc:
            return Response(
                {'detail': str(exc)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(payload)


class MovieCategoriesView(APIView):
    @extend_schema(
        operation_id='list_movie_categories',
        summary='Lista categorias de filmes',
        description='Consulta a API externa para buscar categorias de filmes.',
        responses={
            200: OpenApiResponse(
                response={
                    'type': 'object',
                    'properties': {
                        'results': {
                            'type': 'array',
                            'items': {
                                'type': 'object',
                                'properties': {
                                    'id': {'type': 'string'},
                                    'name': {'type': 'string'},
                                },
                            },
                        },
                        'pagination': {
                            'type': 'object',
                            'properties': {
                                'page': {'type': 'integer'},
                                'page_size': {'type': 'integer'},
                                'has_next': {'type': 'boolean'},
                            },
                        },
                    },
                },
                examples=[
                    OpenApiExample(
                        'Movie categories response',
                        value=build_categories_example(),
                    )
                ],
            ),
            503: OpenApiResponse(description='Falha de configuracao ou integracao com a API externa.'),
        },
    )
    def get(self, request):
        service = TMDbMovieService()

        try:
            payload = service.get_movie_categories()
        except MovieServiceError as exc:
            return Response(
                {'detail': str(exc)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(payload)


class MovieDetailsView(APIView):
    @extend_schema(
        operation_id='retrieve_movie_details',
        summary='Retorna detalhes de um filme por id',
        description='Consulta a API externa para buscar titulo, sinopse, data, imagens e trailer.',
        responses={
            200: OpenApiResponse(
                response={
                    'type': 'object',
                    'properties': {
                        'id': {'type': 'string'},
                        'title': {'type': 'string'},
                        'synopsis': {'type': 'string'},
                        'release_date': {'type': 'string', 'format': 'date'},
                        'runtime': {'type': 'integer', 'nullable': True},
                        'genres': {'type': 'array', 'items': {'type': 'string'}},
                        'status': {'type': 'string'},
                        'vote_average': {'type': 'number', 'nullable': True},
                        'poster_image': {'type': 'string', 'nullable': True},
                        'backdrop_image': {'type': 'string', 'nullable': True},
                        'images': {'type': 'array', 'items': {'type': 'string'}},
                        'media': {
                            'type': 'object',
                            'properties': {
                                'backdrops': {
                                    'type': 'array',
                                    'items': {
                                        'type': 'object',
                                        'properties': {
                                            'preview_image': {'type': 'string'},
                                            'full_image': {'type': 'string'},
                                        },
                                    },
                                },
                                'posters': {
                                    'type': 'array',
                                    'items': {
                                        'type': 'object',
                                        'properties': {
                                            'preview_image': {'type': 'string'},
                                            'full_image': {'type': 'string'},
                                        },
                                    },
                                },
                                'videos': {
                                    'type': 'array',
                                    'items': {
                                        'type': 'object',
                                        'properties': {
                                            'name': {'type': 'string'},
                                            'type': {'type': 'string'},
                                            'youtube_key': {'type': 'string'},
                                            'embed_url': {'type': 'string'},
                                            'thumbnail_image': {'type': 'string'},
                                        },
                                    },
                                },
                            },
                        },
                        'cast': {
                            'type': 'array',
                            'items': {
                                'type': 'object',
                                'properties': {
                                    'id': {'type': 'string'},
                                    'name': {'type': 'string'},
                                    'character': {'type': 'string'},
                                    'profile_image': {'type': 'string', 'nullable': True},
                                },
                            },
                        },
                        'directors': {
                            'type': 'array',
                            'items': {
                                'type': 'object',
                                'properties': {
                                    'id': {'type': 'string'},
                                    'name': {'type': 'string'},
                                    'department': {'type': 'string'},
                                    'profile_image': {'type': 'string', 'nullable': True},
                                },
                            },
                        },
                        'trailer': {
                            'type': 'object',
                            'nullable': True,
                            'properties': {
                                'name': {'type': 'string'},
                                'youtube_key': {'type': 'string'},
                                'embed_url': {'type': 'string'},
                            },
                        },
                        'watch_providers': {
                            'type': 'object',
                            'properties': {
                                'link': {'type': 'string', 'nullable': True},
                                'categories': {
                                    'type': 'array',
                                    'items': {
                                        'type': 'object',
                                        'properties': {
                                            'key': {'type': 'string'},
                                            'label': {'type': 'string'},
                                            'providers': {
                                                'type': 'array',
                                                'items': {
                                                    'type': 'object',
                                                    'properties': {
                                                        'id': {'type': 'string'},
                                                        'name': {'type': 'string'},
                                                        'logo_image': {'type': 'string', 'nullable': True},
                                                        'link': {'type': 'string', 'nullable': True},
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                examples=[
                    OpenApiExample(
                        'Movie details response',
                        value=build_movie_details_example(),
                    )
                ],
            ),
            503: OpenApiResponse(description='Falha de configuracao ou integracao com a API externa.'),
        },
    )
    def get(self, request, movie_id):
        service = TMDbMovieService()

        try:
            payload = service.get_movie_details(movie_id)
        except MovieServiceError as exc:
            return Response(
                {'detail': str(exc)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(payload)


class TvShowDetailsView(APIView):
    @extend_schema(
        operation_id='retrieve_tv_show_details',
        summary='Retorna detalhes de uma serie por id',
        description='Consulta a API externa para buscar dados completos de uma serie.',
        responses={
            200: OpenApiResponse(
                response={
                    'type': 'object',
                    'properties': {
                        'id': {'type': 'string'},
                        'title': {'type': 'string'},
                        'synopsis': {'type': 'string'},
                        'release_date': {'type': 'string', 'format': 'date'},
                        'runtime': {'type': 'integer', 'nullable': True},
                        'genres': {'type': 'array', 'items': {'type': 'string'}},
                        'status': {'type': 'string'},
                        'vote_average': {'type': 'number', 'nullable': True},
                        'poster_image': {'type': 'string', 'nullable': True},
                        'backdrop_image': {'type': 'string', 'nullable': True},
                        'images': {'type': 'array', 'items': {'type': 'string'}},
                        'media': {
                            'type': 'object',
                            'properties': {
                                'backdrops': {
                                    'type': 'array',
                                    'items': {
                                        'type': 'object',
                                        'properties': {
                                            'preview_image': {'type': 'string'},
                                            'full_image': {'type': 'string'},
                                        },
                                    },
                                },
                                'posters': {
                                    'type': 'array',
                                    'items': {
                                        'type': 'object',
                                        'properties': {
                                            'preview_image': {'type': 'string'},
                                            'full_image': {'type': 'string'},
                                        },
                                    },
                                },
                                'videos': {
                                    'type': 'array',
                                    'items': {
                                        'type': 'object',
                                        'properties': {
                                            'name': {'type': 'string'},
                                            'type': {'type': 'string'},
                                            'youtube_key': {'type': 'string'},
                                            'embed_url': {'type': 'string'},
                                            'thumbnail_image': {'type': 'string'},
                                        },
                                    },
                                },
                            },
                        },
                        'cast': {
                            'type': 'array',
                            'items': {
                                'type': 'object',
                                'properties': {
                                    'id': {'type': 'string'},
                                    'name': {'type': 'string'},
                                    'character': {'type': 'string'},
                                    'profile_image': {'type': 'string', 'nullable': True},
                                },
                            },
                        },
                        'creators': {
                            'type': 'array',
                            'items': {
                                'type': 'object',
                                'properties': {
                                    'id': {'type': 'string'},
                                    'name': {'type': 'string'},
                                    'department': {'type': 'string'},
                                    'profile_image': {'type': 'string', 'nullable': True},
                                },
                            },
                        },
                        'trailer': {
                            'type': 'object',
                            'nullable': True,
                            'properties': {
                                'name': {'type': 'string'},
                                'youtube_key': {'type': 'string'},
                                'embed_url': {'type': 'string'},
                            },
                        },
                        'number_of_seasons': {'type': 'integer', 'nullable': True},
                        'number_of_episodes': {'type': 'integer', 'nullable': True},
                        'production_companies': {'type': 'array', 'items': {'type': 'string'}},
                        'watch_providers': {
                            'type': 'object',
                            'properties': {
                                'link': {'type': 'string', 'nullable': True},
                                'categories': {
                                    'type': 'array',
                                    'items': {
                                        'type': 'object',
                                        'properties': {
                                            'key': {'type': 'string'},
                                            'label': {'type': 'string'},
                                            'providers': {
                                                'type': 'array',
                                                'items': {
                                                    'type': 'object',
                                                    'properties': {
                                                        'id': {'type': 'string'},
                                                        'name': {'type': 'string'},
                                                        'logo_image': {'type': 'string', 'nullable': True},
                                                        'link': {'type': 'string', 'nullable': True},
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                examples=[
                    OpenApiExample(
                        'TV show details response',
                        value=build_tv_show_details_example(),
                    )
                ],
            ),
            503: OpenApiResponse(description='Falha de configuracao ou integracao com a API externa.'),
        },
    )
    def get(self, request, tv_show_id):
        service = TMDbMovieService()

        try:
            payload = service.get_tv_show_details(tv_show_id)
        except MovieServiceError as exc:
            return Response(
                {'detail': str(exc)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(payload)


class PopularActorsView(APIView):
    @extend_schema(
        operation_id='list_popular_actors',
        summary='Lista atores populares',
        description='Consulta a API externa para buscar atores populares.',
        responses={
            200: OpenApiResponse(
                response={
                    'type': 'object',
                    'properties': {
                        'results': {
                            'type': 'array',
                            'items': {
                                'type': 'object',
                                'properties': {
                                    'id': {'type': 'string'},
                                    'name': {'type': 'string'},
                                    'known_for_department': {'type': 'string'},
                                    'profile_image': {'type': 'string', 'nullable': True},
                                    'known_for_titles': {
                                        'type': 'array',
                                        'items': {'type': 'string'},
                                    },
                                },
                            },
                        }
                    },
                },
                examples=[
                    OpenApiExample(
                        'Popular actors response',
                        value=build_people_list_example(department='Acting'),
                    )
                ],
            ),
            503: OpenApiResponse(description='Falha de configuracao ou integracao com a API externa.'),
        },
    )
    def get(self, request):
        service = TMDbMovieService()
        page = get_page_number(request)

        try:
            payload = service.get_popular_actors(page=page)
        except MovieServiceError as exc:
            return Response(
                {'detail': str(exc)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(payload)


class PopularDirectorsView(APIView):
    @extend_schema(
        operation_id='list_popular_directors',
        summary='Lista diretores populares',
        description='Consulta a API externa para buscar diretores populares.',
        responses={
            200: OpenApiResponse(
                response={
                    'type': 'object',
                    'properties': {
                        'results': {
                            'type': 'array',
                            'items': {
                                'type': 'object',
                                'properties': {
                                    'id': {'type': 'string'},
                                    'name': {'type': 'string'},
                                    'known_for_department': {'type': 'string'},
                                    'profile_image': {'type': 'string', 'nullable': True},
                                    'known_for_titles': {
                                        'type': 'array',
                                        'items': {'type': 'string'},
                                    },
                                },
                            },
                        },
                        'pagination': {
                            'type': 'object',
                            'properties': {
                                'page': {'type': 'integer'},
                                'page_size': {'type': 'integer'},
                                'has_next': {'type': 'boolean'},
                            },
                        },
                    },
                },
                examples=[
                    OpenApiExample(
                        'Popular directors response',
                        value=build_people_list_example(department='Directing'),
                    )
                ],
            ),
            503: OpenApiResponse(description='Falha de configuracao ou integracao com a API externa.'),
        },
    )
    def get(self, request):
        service = TMDbMovieService()
        page = get_page_number(request)

        try:
            payload = service.get_popular_directors(page=page)
        except MovieServiceError as exc:
            return Response(
                {'detail': str(exc)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(payload)


class PersonDetailsView(APIView):
    @extend_schema(
        operation_id='retrieve_person_details',
        summary='Retorna detalhes de uma pessoa por id',
        description='Consulta a API externa para buscar dados basicos de ator ou diretor.',
        responses={
            200: OpenApiResponse(
                response={
                    'type': 'object',
                    'properties': {
                        'id': {'type': 'string'},
                        'name': {'type': 'string'},
                        'biography': {'type': 'string'},
                        'known_for_department': {'type': 'string'},
                        'birthday': {'type': 'string', 'format': 'date', 'nullable': True},
                        'place_of_birth': {'type': 'string'},
                        'profile_image': {'type': 'string', 'nullable': True},
                        'projects': {
                            'type': 'array',
                            'items': {
                                'type': 'object',
                                'properties': {
                                    'id': {'type': 'string'},
                                    'title': {'type': 'string'},
                                    'release_date': {'type': 'string', 'format': 'date'},
                                    'media_type': {'type': 'string'},
                                    'poster_image': {'type': 'string', 'nullable': True},
                                    'credit': {'type': 'string'},
                                },
                            },
                        },
                    },
                },
                examples=[
                    OpenApiExample(
                        'Person details response',
                        value=build_person_details_example(),
                    )
                ],
            ),
            503: OpenApiResponse(description='Falha de configuracao ou integracao com a API externa.'),
        },
    )
    def get(self, request, person_id):
        service = TMDbMovieService()

        try:
            payload = service.get_person_details(person_id)
        except MovieServiceError as exc:
            return Response(
                {'detail': str(exc)},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        return Response(payload)
