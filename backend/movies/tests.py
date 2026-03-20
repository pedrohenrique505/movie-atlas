import json
from datetime import date
from unittest.mock import MagicMock, patch
from urllib.error import HTTPError

from django.test import SimpleTestCase
from rest_framework.test import APITestCase

from .services import MovieServiceError, TMDbMovieService


class TMDbMovieServiceTests(SimpleTestCase):
    @patch('movies.services.os.getenv', return_value='test-token')
    @patch('movies.services.request.urlopen')
    def test_get_trending_movies_limits_results_to_15(self, mock_urlopen, _mock_getenv):
        response_data = {
            'results': [
                {
                    'id': item_id,
                    'title': f'Filme {item_id}',
                    'release_date': '2026-03-20',
                    'overview': 'Descricao',
                    'poster_path': f'/poster-{item_id}.jpg',
                }
                for item_id in range(1, 18)
            ]
        }
        mock_response = MagicMock()
        mock_response.read.return_value = json.dumps(response_data).encode('utf-8')
        mock_urlopen.return_value.__enter__.return_value = mock_response

        payload = TMDbMovieService().get_trending_movies()

        self.assertEqual(len(payload['results']), 15)
        self.assertEqual(payload['results'][0]['id'], '1')
        self.assertEqual(
            payload['results'][0]['poster_image'],
            'https://image.tmdb.org/t/p/w780/poster-1.jpg',
        )
        self.assertEqual(payload['results'][-1]['id'], '15')

    @patch('movies.services.os.getenv', return_value='test-token')
    @patch('movies.services.request.urlopen')
    def test_get_now_playing_movies_normalizes_response(self, mock_urlopen, _mock_getenv):
        response_data = {
            'results': [
                {
                    'id': 201,
                    'title': 'Filme em Cartaz',
                    'release_date': '2026-03-20',
                    'overview': 'Em exibicao nos cinemas.',
                    'poster_path': '/cartaz.jpg',
                }
            ]
        }
        mock_response = MagicMock()
        mock_response.read.return_value = json.dumps(response_data).encode('utf-8')
        mock_urlopen.return_value.__enter__.return_value = mock_response

        payload = TMDbMovieService().get_now_playing_movies()

        self.assertEqual(
            payload,
            {
                'results': [
                    {
                        'id': '201',
                        'title': 'Filme em Cartaz',
                        'release_date': '2026-03-20',
                        'status': 'now_playing',
                        'synopsis': 'Em exibicao nos cinemas.',
                        'poster_image': 'https://image.tmdb.org/t/p/w780/cartaz.jpg',
                        'has_trailer': False,
                    }
                ],
                'pagination': {'page': 1, 'page_size': 15, 'has_next': False},
            },
        )

    @patch('movies.services.os.getenv', return_value='test-token')
    @patch('movies.services.request.urlopen')
    def test_get_popular_tv_shows_normalizes_response(self, mock_urlopen, _mock_getenv):
        response_data = {
            'results': [
                {
                    'id': 301,
                    'name': 'Serie Exemplo',
                    'first_air_date': '2025-10-01',
                    'overview': 'Uma serie popular.',
                    'poster_path': '/serie.jpg',
                }
            ]
        }
        mock_response = MagicMock()
        mock_response.read.return_value = json.dumps(response_data).encode('utf-8')
        mock_urlopen.return_value.__enter__.return_value = mock_response

        payload = TMDbMovieService().get_popular_tv_shows()

        self.assertEqual(
            payload,
            {
                'results': [
                    {
                        'id': '301',
                        'title': 'Serie Exemplo',
                        'release_date': '2025-10-01',
                        'status': 'tv_show',
                        'synopsis': 'Uma serie popular.',
                        'poster_image': 'https://image.tmdb.org/t/p/w780/serie.jpg',
                        'has_trailer': False,
                    }
                ],
                'pagination': {'page': 1, 'page_size': 15, 'has_next': False},
            },
        )

    @patch('movies.services.os.getenv', return_value='test-token')
    @patch('movies.services.request.urlopen')
    def test_get_movie_categories_normalizes_response(self, mock_urlopen, _mock_getenv):
        response_data = {
            'genres': [
                {'id': 28, 'name': 'Acao'},
                {'id': 18, 'name': 'Drama'},
            ]
        }
        mock_response = MagicMock()
        mock_response.read.return_value = json.dumps(response_data).encode('utf-8')
        mock_urlopen.return_value.__enter__.return_value = mock_response

        payload = TMDbMovieService().get_movie_categories()

        self.assertEqual(
            payload,
            {
                'results': [
                    {'id': '28', 'name': 'Acao'},
                    {'id': '18', 'name': 'Drama'},
                ]
            },
        )

    @patch('movies.services.timezone.localdate', return_value=date(2026, 3, 19))
    @patch('movies.services.os.getenv', return_value='test-token')
    @patch('movies.services.request.urlopen')
    def test_get_upcoming_movies_normalizes_external_response(
        self,
        mock_urlopen,
        _mock_getenv,
        _mock_localdate,
    ):
        response_data = {
            'results': [
                {
                    'id': 101,
                    'title': 'The Odyssey',
                    'release_date': '2026-07-17',
                    'overview': 'Uma nova adaptacao epica.',
                    'poster_path': '/odyssey.jpg',
                }
            ]
        }
        mock_response = MagicMock()
        mock_response.read.return_value = json.dumps(response_data).encode('utf-8')
        mock_urlopen.return_value.__enter__.return_value = mock_response

        payload = TMDbMovieService().get_upcoming_movies()

        self.assertEqual(
            payload,
            {
                'results': [
                    {
                        'id': '101',
                        'title': 'The Odyssey',
                        'release_date': '2026-07-17',
                        'status': 'upcoming',
                        'synopsis': 'Uma nova adaptacao epica.',
                        'poster_image': 'https://image.tmdb.org/t/p/w780/odyssey.jpg',
                        'has_trailer': False,
                    }
                ],
                'pagination': {'page': 1, 'page_size': 15, 'has_next': False},
            },
        )

    @patch('movies.services.os.getenv', return_value='')
    def test_get_upcoming_movies_requires_token(self, _mock_getenv):
        with self.assertRaisesMessage(
            MovieServiceError,
            'A variavel de ambiente TMDB_API_READ_ACCESS_TOKEN nao foi configurada.',
        ):
            TMDbMovieService().get_upcoming_movies()

    @patch('movies.services.os.getenv', return_value='test-token')
    @patch('movies.services.request.urlopen')
    def test_get_upcoming_movies_handles_http_error(self, mock_urlopen, _mock_getenv):
        mock_urlopen.side_effect = HTTPError(
            url='https://api.themoviedb.org/3/movie/upcoming',
            code=502,
            msg='Bad Gateway',
            hdrs=None,
            fp=None,
        )

        with self.assertRaisesMessage(
            MovieServiceError,
            'Falha ao consultar a API externa de filmes: HTTP 502.',
        ):
            TMDbMovieService().get_upcoming_movies()

    @patch('movies.services.timezone.localdate', return_value=date(2026, 3, 19))
    @patch('movies.services.os.getenv', return_value='test-token')
    @patch('movies.services.request.urlopen')
    def test_get_upcoming_movies_filters_past_release_dates(
        self,
        mock_urlopen,
        _mock_getenv,
        _mock_localdate,
    ):
        response_data = {
            'results': [
                {
                    'id': 100,
                    'title': 'Filme Antigo',
                    'release_date': '2026-03-18',
                    'overview': 'Ja estreou.',
                    'poster_path': '/antigo.jpg',
                },
                {
                    'id': 101,
                    'title': 'Filme de Hoje',
                    'release_date': '2026-03-19',
                    'overview': 'Estreia hoje.',
                    'poster_path': '/hoje.jpg',
                },
                {
                    'id': 102,
                    'title': 'Filme Futuro',
                    'release_date': '2026-03-20',
                    'overview': 'Estreia amanha.',
                    'poster_path': '/futuro.jpg',
                },
                {
                    'id': 103,
                    'title': 'Sem Data',
                    'release_date': '',
                    'overview': 'Sem data valida.',
                    'poster_path': '/sem-data.jpg',
                },
            ]
        }
        mock_response = MagicMock()
        mock_response.read.return_value = json.dumps(response_data).encode('utf-8')
        mock_urlopen.return_value.__enter__.return_value = mock_response

        payload = TMDbMovieService().get_upcoming_movies()

        self.assertEqual(
            payload,
            {
                'results': [
                    {
                        'id': '101',
                        'title': 'Filme de Hoje',
                        'release_date': '2026-03-19',
                        'status': 'upcoming',
                        'synopsis': 'Estreia hoje.',
                        'poster_image': 'https://image.tmdb.org/t/p/w780/hoje.jpg',
                        'has_trailer': False,
                    },
                    {
                        'id': '102',
                        'title': 'Filme Futuro',
                        'release_date': '2026-03-20',
                        'status': 'upcoming',
                        'synopsis': 'Estreia amanha.',
                        'poster_image': 'https://image.tmdb.org/t/p/w780/futuro.jpg',
                        'has_trailer': False,
                    },
                ],
                'pagination': {'page': 1, 'page_size': 15, 'has_next': False},
            },
        )

    @patch('movies.services.os.getenv', return_value='test-token')
    @patch('movies.services.request.urlopen')
    def test_search_movies_normalizes_response(self, mock_urlopen, _mock_getenv):
        response_data = {
            'results': [
                {
                    'id': 909,
                    'media_type': 'movie',
                    'title': 'Blade Runner',
                    'release_date': '1982-06-25',
                    'overview': 'Neo-noir de ficcao cientifica.',
                    'poster_path': '/blade-runner.jpg',
                },
                {
                    'id': 777,
                    'media_type': 'person',
                    'name': 'Harrison Ford',
                    'known_for_department': 'Acting',
                    'profile_path': '/harrison-ford.jpg',
                    'known_for': [{'title': 'Blade Runner'}, {'title': 'Witness'}],
                }
            ]
        }
        mock_response = MagicMock()
        mock_response.read.return_value = json.dumps(response_data).encode('utf-8')
        mock_urlopen.return_value.__enter__.return_value = mock_response

        payload = TMDbMovieService().search_movies('blade')

        self.assertEqual(
            payload,
            {
                'results': [
                    {
                        'id': '909',
                        'media_type': 'movie',
                        'title': 'Blade Runner',
                        'release_date': '1982-06-25',
                        'status': 'search_result',
                        'synopsis': 'Neo-noir de ficcao cientifica.',
                        'poster_image': 'https://image.tmdb.org/t/p/w780/blade-runner.jpg',
                        'has_trailer': False,
                    },
                    {
                        'id': '777',
                        'media_type': 'person',
                        'name': 'Harrison Ford',
                        'known_for_department': 'Acting',
                        'profile_image': 'https://image.tmdb.org/t/p/w300/harrison-ford.jpg',
                        'known_for_titles': ['Blade Runner', 'Witness'],
                    }
                ],
                'pagination': {'page': 1, 'page_size': 15, 'has_next': False},
            },
        )

    @patch('movies.services.os.getenv', return_value='test-token')
    @patch('movies.services.request.urlopen')
    def test_get_popular_actors_uses_distinct_logical_pages(self, mock_urlopen, _mock_getenv):
        def build_payload(page_number):
            results = []
            for offset in range(20):
                person_id = ((page_number - 1) * 20) + offset + 1
                department = 'Acting' if offset < 10 else 'Directing'
                results.append(
                    {
                        'id': person_id,
                        'name': f'Pessoa {person_id}',
                        'known_for_department': department,
                        'profile_path': f'/person-{person_id}.jpg',
                        'known_for': [{'title': f'Obra {person_id}'}],
                    }
                )

            return {
                'page': page_number,
                'total_pages': 10,
                'results': results,
            }

        def build_mock_response(payload):
            mock_response = MagicMock()
            mock_response.read.return_value = json.dumps(payload).encode('utf-8')
            context_manager = MagicMock()
            context_manager.__enter__.return_value = mock_response
            context_manager.__exit__.return_value = False
            return context_manager

        mock_urlopen.side_effect = [
            build_mock_response(build_payload(1)),
            build_mock_response(build_payload(2)),
            build_mock_response(build_payload(1)),
            build_mock_response(build_payload(2)),
            build_mock_response(build_payload(3)),
            build_mock_response(build_payload(4)),
        ]

        first_page = TMDbMovieService().get_popular_actors(page=1)
        second_page = TMDbMovieService().get_popular_actors(page=2)

        self.assertEqual(first_page['pagination'], {'page': 1, 'page_size': 15, 'has_next': True})
        self.assertEqual(second_page['pagination'], {'page': 2, 'page_size': 15, 'has_next': True})
        self.assertEqual(first_page['results'][0]['id'], '1')
        self.assertEqual(first_page['results'][-1]['id'], '25')
        self.assertEqual(second_page['results'][0]['id'], '26')
        self.assertEqual(second_page['results'][-1]['id'], '50')

    @patch('movies.services.os.getenv', return_value='test-token')
    @patch('movies.services.request.urlopen')
    def test_get_movie_details_normalizes_images_and_trailer(self, mock_urlopen, _mock_getenv):
        response_data = {
            'id': 101,
            'title': 'The Odyssey',
            'release_date': '2026-07-17',
            'runtime': 164,
            'genres': [{'id': 1, 'name': 'Sci-Fi'}, {'id': 2, 'name': 'Adventure'}],
            'status': 'Released',
            'vote_average': 7.28,
            'overview': 'Uma nova adaptacao epica.',
            'poster_path': '/poster.jpg',
            'backdrop_path': '/backdrop.jpg',
            'videos': {
                'results': [
                    {
                        'name': 'Teaser',
                        'site': 'YouTube',
                        'type': 'Teaser',
                        'official': False,
                        'key': 'teaser123',
                    },
                    {
                        'name': 'Trailer oficial',
                        'site': 'YouTube',
                        'type': 'Trailer',
                        'official': True,
                        'key': 'trailer123',
                    },
                ]
            },
            'images': {
                'backdrops': [{'file_path': '/img-1.jpg'}],
                'posters': [{'file_path': '/img-2.jpg'}],
            },
            'credits': {
                'crew': [
                    {
                        'id': 777,
                        'name': 'Christopher Nolan',
                        'job': 'Director',
                        'department': 'Directing',
                        'profile_path': '/director.jpg',
                    }
                ],
                'cast': [
                    {
                        'id': 501,
                        'name': 'Matt Damon',
                        'character': 'Ryland Grace',
                        'profile_path': '/cast-1.jpg',
                    }
                ]
            },
        }
        watch_providers_data = {
            'results': {
                'BR': {
                    'link': 'https://www.themoviedb.org/movie/101/watch',
                    'flatrate': [
                        {
                            'provider_id': 8,
                            'provider_name': 'Netflix',
                            'logo_path': '/netflix.jpg',
                        }
                    ],
                }
            }
        }

        def build_mock_response(payload):
            mock_response = MagicMock()
            mock_response.read.return_value = json.dumps(payload).encode('utf-8')
            context_manager = MagicMock()
            context_manager.__enter__.return_value = mock_response
            context_manager.__exit__.return_value = False
            return context_manager

        mock_urlopen.side_effect = [
            build_mock_response(response_data),
            build_mock_response(watch_providers_data),
        ]

        payload = TMDbMovieService().get_movie_details('101')

        self.assertEqual(payload['id'], '101')
        self.assertEqual(payload['title'], 'The Odyssey')
        self.assertEqual(payload['runtime'], 164)
        self.assertEqual(payload['genres'], ['Sci-Fi', 'Adventure'])
        self.assertEqual(payload['status'], 'Lançado')
        self.assertEqual(payload['vote_average'], 7.3)
        self.assertEqual(payload['poster_image'], 'https://image.tmdb.org/t/p/w780/poster.jpg')
        self.assertEqual(
            payload['backdrop_image'],
            'https://image.tmdb.org/t/p/w1280/backdrop.jpg',
        )
        self.assertEqual(
            payload['images'],
            [
                'https://image.tmdb.org/t/p/w780/img-1.jpg',
                'https://image.tmdb.org/t/p/w780/img-2.jpg',
            ],
        )
        self.assertEqual(
            payload['media']['backdrops'],
            [
                {
                    'preview_image': 'https://image.tmdb.org/t/p/w1280/img-1.jpg',
                    'full_image': 'https://image.tmdb.org/t/p/original/img-1.jpg',
                }
            ],
        )
        self.assertEqual(
            payload['media']['posters'],
            [
                {
                    'preview_image': 'https://image.tmdb.org/t/p/w780/img-2.jpg',
                    'full_image': 'https://image.tmdb.org/t/p/original/img-2.jpg',
                }
            ],
        )
        self.assertEqual(payload['media']['videos'][0]['thumbnail_image'], 'https://img.youtube.com/vi/trailer123/hqdefault.jpg')
        self.assertEqual(
            payload['cast'],
            [
                {
                    'id': '501',
                    'name': 'Matt Damon',
                    'character': 'Ryland Grace',
                    'profile_image': 'https://image.tmdb.org/t/p/w300/cast-1.jpg',
                }
            ],
        )
        self.assertEqual(
            payload['directors'],
            [
                {
                    'id': '777',
                    'name': 'Christopher Nolan',
                    'department': 'Directing',
                    'profile_image': 'https://image.tmdb.org/t/p/w300/director.jpg',
                }
            ],
        )
        self.assertEqual(
            payload['trailer'],
            {
                'name': 'Trailer oficial',
                'youtube_key': 'trailer123',
                'embed_url': 'https://www.youtube.com/embed/trailer123',
            },
        )
        self.assertEqual(
            payload['watch_providers'],
            {
                'link': 'https://www.themoviedb.org/movie/101/watch',
                'categories': [
                    {
                        'key': 'flatrate',
                        'label': 'Streaming',
                        'providers': [
                            {
                                'id': '8',
                                'name': 'Netflix',
                                'logo_image': 'https://image.tmdb.org/t/p/w300/netflix.jpg',
                                'link': 'https://www.themoviedb.org/movie/101/watch',
                            }
                        ],
                    }
                ],
            },
        )

    @patch('movies.services.os.getenv', return_value='test-token')
    @patch('movies.services.request.urlopen')
    def test_get_tv_show_details_normalizes_images_trailer_and_creators(
        self,
        mock_urlopen,
        _mock_getenv,
    ):
        response_data = {
            'id': 85552,
            'name': 'Silo',
            'first_air_date': '2023-05-04',
            'episode_run_time': [49],
            'genres': [{'id': 18, 'name': 'Drama'}, {'id': 10765, 'name': 'Sci-Fi'}],
            'status': 'Returning Series',
            'vote_average': 8.24,
            'overview': 'Uma serie distopica.',
            'poster_path': '/tv-poster.jpg',
            'backdrop_path': '/tv-backdrop.jpg',
            'number_of_seasons': 2,
            'number_of_episodes': 20,
            'production_companies': [{'name': 'AMC Studios'}],
            'created_by': [
                {
                    'id': 123,
                    'name': 'Graham Yost',
                    'profile_path': '/creator.jpg',
                }
            ],
            'videos': {
                'results': [
                    {
                        'name': 'Trailer oficial',
                        'site': 'YouTube',
                        'type': 'Trailer',
                        'official': True,
                        'key': 'silo123',
                    }
                ]
            },
            'images': {
                'backdrops': [{'file_path': '/tv-img-1.jpg'}],
                'posters': [{'file_path': '/tv-img-2.jpg'}],
            },
            'aggregate_credits': {
                'cast': [
                    {
                        'id': 501,
                        'name': 'Rebecca Ferguson',
                        'roles': [{'character': 'Juliette'}],
                        'profile_path': '/tv-cast.jpg',
                    }
                ]
            },
            'credits': {
                'crew': [
                    {
                        'id': 123,
                        'name': 'Graham Yost',
                        'job': 'Creator',
                        'department': 'Writing',
                        'profile_path': '/creator.jpg',
                    }
                ]
            },
        }
        watch_providers_data = {
            'results': {
                'BR': {
                    'link': 'https://www.themoviedb.org/tv/85552/watch',
                    'flatrate': [
                        {
                            'provider_id': 350,
                            'provider_name': 'Apple TV+',
                            'logo_path': '/apple-tv.jpg',
                        }
                    ],
                }
            }
        }

        def build_mock_response(payload):
            mock_response = MagicMock()
            mock_response.read.return_value = json.dumps(payload).encode('utf-8')
            context_manager = MagicMock()
            context_manager.__enter__.return_value = mock_response
            context_manager.__exit__.return_value = False
            return context_manager

        mock_urlopen.side_effect = [
            build_mock_response(response_data),
            build_mock_response(watch_providers_data),
        ]

        payload = TMDbMovieService().get_tv_show_details('85552')

        self.assertEqual(payload['id'], '85552')
        self.assertEqual(payload['title'], 'Silo')
        self.assertEqual(payload['release_date'], '2023-05-04')
        self.assertEqual(payload['runtime'], 49)
        self.assertEqual(payload['genres'], ['Drama', 'Sci-Fi'])
        self.assertEqual(payload['status'], 'Série em andamento')
        self.assertEqual(payload['vote_average'], 8.2)
        self.assertEqual(payload['number_of_seasons'], 2)
        self.assertEqual(payload['number_of_episodes'], 20)
        self.assertEqual(payload['production_companies'], ['AMC Studios'])
        self.assertEqual(payload['media']['backdrops'][0]['preview_image'], 'https://image.tmdb.org/t/p/w1280/tv-img-1.jpg')
        self.assertEqual(payload['media']['posters'][0]['preview_image'], 'https://image.tmdb.org/t/p/w780/tv-img-2.jpg')
        self.assertEqual(payload['media']['videos'][0]['thumbnail_image'], 'https://img.youtube.com/vi/silo123/hqdefault.jpg')
        self.assertEqual(
            payload['cast'],
            [
                {
                    'id': '501',
                    'name': 'Rebecca Ferguson',
                    'character': 'Juliette',
                    'profile_image': 'https://image.tmdb.org/t/p/w300/tv-cast.jpg',
                }
            ],
        )
        self.assertEqual(
            payload['creators'],
            [
                {
                    'id': '123',
                    'name': 'Graham Yost',
                    'department': 'Writing',
                    'profile_image': 'https://image.tmdb.org/t/p/w300/creator.jpg',
                }
            ],
        )
        self.assertEqual(
            payload['trailer'],
            {
                'name': 'Trailer oficial',
                'youtube_key': 'silo123',
                'embed_url': 'https://www.youtube.com/embed/silo123',
            },
        )
        self.assertEqual(
            payload['watch_providers'],
            {
                'link': 'https://www.themoviedb.org/tv/85552/watch',
                'categories': [
                    {
                        'key': 'flatrate',
                        'label': 'Streaming',
                        'providers': [
                            {
                                'id': '350',
                                'name': 'Apple TV+',
                                'logo_image': 'https://image.tmdb.org/t/p/w300/apple-tv.jpg',
                                'link': 'https://www.themoviedb.org/tv/85552/watch',
                            }
                        ],
                    }
                ],
            },
        )

    @patch('movies.services.os.getenv', return_value='test-token')
    @patch('movies.services.request.urlopen')
    def test_get_person_details_normalizes_response(self, mock_urlopen, _mock_getenv):
        response_data = {
            'id': 777,
            'name': 'Christopher Nolan',
            'biography': 'Biografia resumida.',
            'known_for_department': 'Directing',
            'birthday': '1970-07-30',
            'place_of_birth': 'London, England, UK',
            'profile_path': '/person.jpg',
            'combined_credits': {
                'cast': [
                    {
                        'id': 201,
                        'title': 'Actor Credit',
                        'release_date': '2001-01-01',
                        'media_type': 'movie',
                        'poster_path': '/actor-credit.jpg',
                        'character': 'Narrator',
                        'popularity': 15.2,
                        'vote_count': 120,
                        'order': 3,
                    }
                ],
                'crew': [
                    {
                        'id': 101,
                        'title': 'Inception',
                        'release_date': '2014-01-01',
                        'media_type': 'movie',
                        'poster_path': '/inception-new.jpg',
                        'job': 'Producer',
                        'popularity': 70.0,
                        'vote_count': 9000,
                        'order': 4,
                    },
                    {
                        'id': 101,
                        'title': 'Inception',
                        'release_date': '2010-07-16',
                        'media_type': 'movie',
                        'poster_path': '/inception.jpg',
                        'job': 'Director',
                        'popularity': 85.5,
                        'vote_count': 15000,
                        'order': 2,
                    },
                    {
                        'id': 102,
                        'name': 'Westworld',
                        'first_air_date': '2016-10-02',
                        'media_type': 'tv',
                        'poster_path': '/westworld.jpg',
                        'job': 'Executive Producer',
                        'popularity': 88.3,
                        'vote_count': 5400,
                        'genre_ids': [18, 9648, 10765],
                        'order': 6,
                    },
                    {
                        'id': 106,
                        'name': 'Late Night Awards',
                        'first_air_date': '2024-01-01',
                        'media_type': 'tv',
                        'poster_path': '/late-night-awards.jpg',
                        'job': 'Self',
                        'popularity': 500.0,
                        'vote_count': 900,
                        'genre_ids': [10767],
                        'order': 1,
                    },
                    {
                        'id': 103,
                        'media_type': 'movie',
                        'release_date': '2020-01-01',
                        'poster_path': '/missing-title.jpg',
                        'job': 'Director',
                    },
                    {
                        'id': 104,
                        'title': 'Invalid Media Type',
                        'media_type': 'person',
                        'release_date': '2021-01-01',
                        'poster_path': '/invalid-media-type.jpg',
                        'job': 'Director',
                    },
                    {
                        'id': 105,
                        'title': 'Missing Job',
                        'media_type': 'movie',
                        'release_date': '2022-01-01',
                        'poster_path': '/missing-job.jpg',
                    },
                ],
            },
        }
        mock_response = MagicMock()
        mock_response.read.return_value = json.dumps(response_data).encode('utf-8')
        mock_urlopen.return_value.__enter__.return_value = mock_response

        payload = TMDbMovieService().get_person_details('777')

        self.assertEqual(
            payload,
            {
                'id': '777',
                'name': 'Christopher Nolan',
                'biography': 'Biografia resumida.',
                'known_for_department': 'Directing',
                'birthday': '1970-07-30',
                'place_of_birth': 'London, England, UK',
                'profile_image': 'https://image.tmdb.org/t/p/w780/person.jpg',
                'top_works': [
                    {
                        'id': '106',
                        'title': 'Late Night Awards',
                        'release_date': '2024-01-01',
                        'media_type': 'tv',
                        'poster_image': 'https://image.tmdb.org/t/p/w780/late-night-awards.jpg',
                        'credit': 'Self',
                        'popularity': 500.0,
                        'vote_count': 900,
                        'order': 1,
                    },
                    {
                        'id': '102',
                        'title': 'Westworld',
                        'release_date': '2016-10-02',
                        'media_type': 'tv',
                        'poster_image': 'https://image.tmdb.org/t/p/w780/westworld.jpg',
                        'credit': 'Executive Producer',
                        'popularity': 88.3,
                        'vote_count': 5400,
                        'order': 6,
                    },
                    {
                        'id': '101',
                        'title': 'Inception',
                        'release_date': '2010-07-16',
                        'media_type': 'movie',
                        'poster_image': 'https://image.tmdb.org/t/p/w780/inception.jpg',
                        'credit': 'Director',
                        'popularity': 85.5,
                        'vote_count': 15000,
                        'order': 2,
                    },
                    {
                        'id': '201',
                        'title': 'Actor Credit',
                        'release_date': '2001-01-01',
                        'media_type': 'movie',
                        'poster_image': 'https://image.tmdb.org/t/p/w780/actor-credit.jpg',
                        'credit': 'Narrator',
                        'popularity': 15.2,
                        'vote_count': 120,
                        'order': 3,
                    },
                ],
                'credits': [
                    {
                        'id': '106',
                        'title': 'Late Night Awards',
                        'release_date': '2024-01-01',
                        'media_type': 'tv',
                        'poster_image': 'https://image.tmdb.org/t/p/w780/late-night-awards.jpg',
                        'credit': 'Self',
                        'popularity': 500.0,
                        'vote_count': 900,
                        'order': 1,
                    },
                    {
                        'id': '102',
                        'title': 'Westworld',
                        'release_date': '2016-10-02',
                        'media_type': 'tv',
                        'poster_image': 'https://image.tmdb.org/t/p/w780/westworld.jpg',
                        'credit': 'Executive Producer',
                        'popularity': 88.3,
                        'vote_count': 5400,
                        'order': 6,
                    },
                    {
                        'id': '101',
                        'title': 'Inception',
                        'release_date': '2010-07-16',
                        'media_type': 'movie',
                        'poster_image': 'https://image.tmdb.org/t/p/w780/inception.jpg',
                        'credit': 'Director',
                        'popularity': 85.5,
                        'vote_count': 15000,
                        'order': 2,
                    },
                    {
                        'id': '201',
                        'title': 'Actor Credit',
                        'release_date': '2001-01-01',
                        'media_type': 'movie',
                        'poster_image': 'https://image.tmdb.org/t/p/w780/actor-credit.jpg',
                        'credit': 'Narrator',
                        'popularity': 15.2,
                        'vote_count': 120,
                        'order': 3,
                    },
                ],
            },
        )

    def test_normalize_person_credits_filters_invalid_and_duplicate_credits(self):
        payload = TMDbMovieService()._normalize_person_credits(
            {
                'cast': [
                    {
                        'id': 201,
                        'title': 'Duplicate Movie',
                        'release_date': '2001-01-01',
                        'media_type': 'movie',
                        'poster_path': '/duplicate-cast.jpg',
                        'character': 'Lead',
                        'popularity': 20.0,
                        'vote_count': 200,
                        'order': 8,
                    },
                    {
                        'id': 202,
                        'title': 'Missing Cast Credit',
                        'release_date': '2002-01-01',
                        'media_type': 'movie',
                        'poster_path': '/missing-cast-credit.jpg',
                        'character': '',
                        'popularity': 10.0,
                        'vote_count': 50,
                    },
                ],
                'crew': [
                    {
                        'id': 201,
                        'title': 'Duplicate Movie',
                        'release_date': '2005-01-01',
                        'media_type': 'movie',
                        'poster_path': '/duplicate-crew.jpg',
                        'job': 'Producer',
                        'popularity': 40.0,
                        'vote_count': 400,
                        'order': 5,
                    },
                    {
                        'id': 203,
                        'title': '',
                        'release_date': '2003-01-01',
                        'media_type': 'movie',
                        'poster_path': '/missing-title.jpg',
                        'job': 'Director',
                    },
                    {
                        'id': 204,
                        'title': 'Unsupported Media Type',
                        'release_date': '2004-01-01',
                        'media_type': 'person',
                        'poster_path': '/unsupported-media.jpg',
                        'job': 'Director',
                    },
                    {
                        'id': 205,
                        'title': 'Missing Crew Credit',
                        'release_date': '2006-01-01',
                        'media_type': 'movie',
                        'poster_path': '/missing-crew-credit.jpg',
                        'job': '',
                        'department': '',
                    },
                ],
            }
        )

        self.assertEqual(
            payload,
            [
                {
                    'id': '201',
                    'title': 'Duplicate Movie',
                    'release_date': '2005-01-01',
                    'media_type': 'movie',
                    'poster_image': 'https://image.tmdb.org/t/p/w780/duplicate-crew.jpg',
                    'credit': 'Producer',
                    'credit_type': 'crew',
                    'popularity': 40.0,
                    'vote_count': 400,
                    'order': 5,
                }
            ],
        )

    def test_build_person_top_works_sorts_by_popularity_and_ascending_order(self):
        payload = TMDbMovieService()._build_person_top_works(
            [
                {
                    'id': '301',
                    'title': 'Most Popular',
                    'release_date': '2010-01-01',
                    'media_type': 'movie',
                    'poster_image': 'https://image.tmdb.org/t/p/w780/most-popular.jpg',
                    'credit': 'Hero',
                    'credit_type': 'cast',
                    'popularity': 120.5,
                    'vote_count': 1000,
                    'order': 7,
                },
                {
                    'id': '302',
                    'title': 'Tie On Popularity Higher Order',
                    'release_date': '2015-01-01',
                    'media_type': 'movie',
                    'poster_image': 'https://image.tmdb.org/t/p/w780/tie-older.jpg',
                    'credit': 'Hero',
                    'credit_type': 'cast',
                    'popularity': 80.0,
                    'vote_count': 500,
                    'order': 5,
                },
                {
                    'id': '303',
                    'title': 'Tie On Popularity Lower Order',
                    'release_date': '2012-01-01',
                    'media_type': 'movie',
                    'poster_image': 'https://image.tmdb.org/t/p/w780/tie-more-votes.jpg',
                    'credit': 'Hero',
                    'credit_type': 'cast',
                    'popularity': 80.0,
                    'vote_count': 900,
                    'order': 1,
                },
                {
                    'id': '304',
                    'title': 'No Order Provided',
                    'release_date': '2018-06-01',
                    'media_type': 'movie',
                    'poster_image': 'https://image.tmdb.org/t/p/w780/tie-newer.jpg',
                    'credit': 'Hero',
                    'credit_type': 'cast',
                    'popularity': 50.0,
                    'vote_count': 300,
                    'order': 15,
                },
            ]
        )

        self.assertEqual(
            [project['id'] for project in payload],
            ['301', '303', '302', '304'],
        )

    @patch('movies.services.os.getenv', return_value='test-token')
    @patch('movies.services.request.urlopen')
    def test_get_popular_people_filters_by_department(self, mock_urlopen, _mock_getenv):
        def build_mock_response(payload):
            mock_response = MagicMock()
            mock_response.read.return_value = json.dumps(payload).encode('utf-8')
            context_manager = MagicMock()
            context_manager.__enter__.return_value = mock_response
            context_manager.__exit__.return_value = False
            return context_manager

        mock_urlopen.side_effect = [
            build_mock_response(
                {
                    'results': [
                        {
                            'id': 701,
                            'name': 'Actor Example',
                            'known_for_department': 'Acting',
                            'profile_path': '/actor.jpg',
                            'known_for': [{'title': 'Film A'}, {'name': 'Show B'}],
                        },
                        {
                            'id': 702,
                            'name': 'Director Example',
                            'known_for_department': 'Directing',
                            'profile_path': '/director.jpg',
                            'known_for': [{'title': 'Film C'}],
                        },
                    ]
                }
            ),
            build_mock_response({'results': []}),
            build_mock_response(
                {
                    'results': [
                        {
                            'id': 701,
                            'name': 'Actor Example',
                            'known_for_department': 'Acting',
                            'profile_path': '/actor.jpg',
                            'known_for': [{'title': 'Film A'}, {'name': 'Show B'}],
                        },
                        {
                            'id': 702,
                            'name': 'Director Example',
                            'known_for_department': 'Directing',
                            'profile_path': '/director.jpg',
                            'known_for': [{'title': 'Film C'}],
                        },
                    ]
                }
            ),
            build_mock_response({'results': []}),
        ]

        actors_payload = TMDbMovieService().get_popular_actors()
        directors_payload = TMDbMovieService().get_popular_directors()

        self.assertEqual(
            actors_payload,
            {
                'results': [
                    {
                        'id': '701',
                        'name': 'Actor Example',
                        'known_for_department': 'Acting',
                        'profile_image': 'https://image.tmdb.org/t/p/w300/actor.jpg',
                        'known_for_titles': ['Film A', 'Show B'],
                    }
                ],
                'pagination': {'page': 1, 'page_size': 15, 'has_next': False},
            },
        )
        self.assertEqual(
            directors_payload,
            {
                'results': [
                    {
                        'id': '702',
                        'name': 'Director Example',
                        'known_for_department': 'Directing',
                        'profile_image': 'https://image.tmdb.org/t/p/w300/director.jpg',
                        'known_for_titles': ['Film C'],
                    }
                ],
                'pagination': {'page': 1, 'page_size': 15, 'has_next': False},
            },
        )

    @patch('movies.services.os.getenv', return_value='test-token')
    @patch('movies.services.request.urlopen')
    def test_get_trending_people_normalizes_response(self, mock_urlopen, _mock_getenv):
        response_data = {
            'total_pages': 4,
            'results': [
                {
                    'id': 901,
                    'name': 'Pessoa em Alta',
                    'known_for_department': 'Acting',
                    'profile_path': '/person-901.jpg',
                    'known_for': [{'title': 'Obra Um'}, {'name': 'Obra Dois'}],
                }
            ],
        }
        mock_response = MagicMock()
        mock_response.read.return_value = json.dumps(response_data).encode('utf-8')
        mock_urlopen.return_value.__enter__.return_value = mock_response

        payload = TMDbMovieService().get_trending_people(page=2)

        self.assertEqual(
            payload,
            {
                'results': [
                    {
                        'id': '901',
                        'name': 'Pessoa em Alta',
                        'known_for_department': 'Acting',
                        'profile_image': 'https://image.tmdb.org/t/p/w300/person-901.jpg',
                        'known_for_titles': ['Obra Um', 'Obra Dois'],
                    }
                ],
                'pagination': {'page': 2, 'page_size': 15, 'has_next': True},
            },
        )

    @patch('movies.services.os.getenv', return_value='test-token')
    @patch('movies.services.request.urlopen')
    def test_get_top_rated_movies_normalizes_response(self, mock_urlopen, _mock_getenv):
        response_data = {
            'results': [
                {
                    'id': 951,
                    'title': 'Filme Nota Alta',
                    'release_date': '2026-04-18',
                    'overview': 'Filme com grande avaliacao.',
                    'poster_path': '/top-rated.jpg',
                }
            ]
        }
        mock_response = MagicMock()
        mock_response.read.return_value = json.dumps(response_data).encode('utf-8')
        mock_urlopen.return_value.__enter__.return_value = mock_response

        payload = TMDbMovieService().get_top_rated_movies(page=1)

        self.assertEqual(
            payload,
            {
                'results': [
                    {
                        'id': '951',
                        'title': 'Filme Nota Alta',
                        'release_date': '2026-04-18',
                        'status': 'top_rated',
                        'synopsis': 'Filme com grande avaliacao.',
                        'poster_image': 'https://image.tmdb.org/t/p/w780/top-rated.jpg',
                        'has_trailer': False,
                    }
                ],
                'pagination': {'page': 1, 'page_size': 15, 'has_next': False},
            },
        )


class UpcomingMoviesIntegrationTests(APITestCase):
    @patch('movies.views.TMDbMovieService.get_upcoming_movies')
    def test_upcoming_movies_endpoint_returns_service_payload(self, mock_get_upcoming_movies):
        mock_get_upcoming_movies.return_value = {
            'results': [
                {
                    'id': '101',
                    'title': 'The Odyssey',
                    'release_date': '2026-07-17',
                    'status': 'upcoming',
                    'synopsis': 'Uma nova adaptacao epica.',
                    'poster_image': 'https://image.tmdb.org/t/p/w780/poster.jpg',
                    'has_trailer': False,
                }
            ],
            'pagination': {'page': 2, 'page_size': 15, 'has_next': True},
        }

        response = self.client.get('/api/movies/upcoming?page=2')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), mock_get_upcoming_movies.return_value)
        mock_get_upcoming_movies.assert_called_once_with(page=2)

    @patch('movies.views.TMDbMovieService.get_upcoming_movies')
    def test_upcoming_movies_endpoint_returns_503_when_service_fails(
        self,
        mock_get_upcoming_movies,
    ):
        mock_get_upcoming_movies.side_effect = MovieServiceError('API externa indisponivel.')

        response = self.client.get('/api/movies/upcoming')

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json(), {'detail': 'API externa indisponivel.'})


class TrendingMoviesIntegrationTests(APITestCase):
    @patch('movies.views.TMDbMovieService.get_trending_movies')
    def test_trending_movies_endpoint_returns_service_payload(self, mock_get_trending_movies):
        mock_get_trending_movies.return_value = {
            'results': [
                {
                    'id': '301',
                    'title': 'Filme em Tendencia',
                    'release_date': '2026-03-20',
                    'status': 'trending',
                    'synopsis': 'Popular agora.',
                    'poster_image': 'https://image.tmdb.org/t/p/w780/trending.jpg',
                    'has_trailer': False,
                }
            ],
            'pagination': {'page': 3, 'page_size': 15, 'has_next': True},
        }

        response = self.client.get('/api/movies/trending?page=3')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), mock_get_trending_movies.return_value)
        mock_get_trending_movies.assert_called_once_with(page=3)


class TrendingPeopleIntegrationTests(APITestCase):
    @patch('movies.views.TMDbMovieService.get_trending_people')
    def test_trending_people_endpoint_returns_service_payload(self, mock_get_trending_people):
        mock_get_trending_people.return_value = {
            'results': [
                {
                    'id': '901',
                    'name': 'Pessoa em Alta',
                    'known_for_department': 'Acting',
                    'profile_image': 'https://image.tmdb.org/t/p/w300/person-901.jpg',
                    'known_for_titles': ['Obra Um'],
                }
            ],
            'pagination': {'page': 2, 'page_size': 15, 'has_next': True},
        }

        response = self.client.get('/api/people/trending?page=2')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), mock_get_trending_people.return_value)
        mock_get_trending_people.assert_called_once_with(page=2)


class SearchMoviesIntegrationTests(APITestCase):
    @patch('movies.views.TMDbMovieService.search_movies')
    def test_search_movies_endpoint_returns_service_payload(self, mock_search_movies):
        mock_search_movies.return_value = {
            'results': [
                {
                    'id': '909',
                    'media_type': 'movie',
                    'title': 'Blade Runner',
                    'release_date': '1982-06-25',
                    'status': 'search_result',
                    'synopsis': 'Neo-noir de ficcao cientifica.',
                    'poster_image': 'https://image.tmdb.org/t/p/w780/blade-runner.jpg',
                    'has_trailer': False,
                },
                {
                    'id': '777',
                    'media_type': 'person',
                    'name': 'Harrison Ford',
                    'known_for_department': 'Acting',
                    'profile_image': 'https://image.tmdb.org/t/p/w300/harrison-ford.jpg',
                    'known_for_titles': ['Blade Runner', 'Witness'],
                }
            ],
            'pagination': {'page': 1, 'page_size': 15, 'has_next': False},
        }

        response = self.client.get('/api/search?q=blade')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), mock_search_movies.return_value)


class PopularMoviesIntegrationTests(APITestCase):
    @patch('movies.views.TMDbMovieService.get_popular_movies')
    def test_popular_movies_endpoint_returns_service_payload(self, mock_get_popular_movies):
        mock_get_popular_movies.return_value = {
            'results': [
                {
                    'id': '901',
                    'title': 'Filme Popular',
                    'release_date': '2026-05-22',
                    'status': 'popular',
                    'synopsis': 'Filme popular do momento.',
                    'poster_image': 'https://image.tmdb.org/t/p/w780/popular.jpg',
                    'has_trailer': False,
                }
            ],
            'pagination': {'page': 2, 'page_size': 15, 'has_next': True},
        }

        response = self.client.get('/api/movies/popular?page=2')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), mock_get_popular_movies.return_value)
        mock_get_popular_movies.assert_called_once_with(page=2)


class TopRatedMoviesIntegrationTests(APITestCase):
    @patch('movies.views.TMDbMovieService.get_top_rated_movies')
    def test_top_rated_movies_endpoint_returns_service_payload(self, mock_get_top_rated_movies):
        mock_get_top_rated_movies.return_value = {
            'results': [
                {
                    'id': '951',
                    'title': 'Filme Nota Alta',
                    'release_date': '2026-04-18',
                    'status': 'top_rated',
                    'synopsis': 'Filme com grande avaliacao.',
                    'poster_image': 'https://image.tmdb.org/t/p/w780/top-rated.jpg',
                    'has_trailer': False,
                }
            ],
            'pagination': {'page': 2, 'page_size': 15, 'has_next': True},
        }

        response = self.client.get('/api/movies/top-rated?page=2')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), mock_get_top_rated_movies.return_value)
        mock_get_top_rated_movies.assert_called_once_with(page=2)


class NowPlayingMoviesIntegrationTests(APITestCase):
    @patch('movies.views.TMDbMovieService.get_now_playing_movies')
    def test_now_playing_movies_endpoint_returns_service_payload(
        self,
        mock_get_now_playing_movies,
    ):
        mock_get_now_playing_movies.return_value = {
            'results': [
                {
                    'id': '401',
                    'title': 'Filme em Cartaz',
                    'release_date': '2026-03-20',
                    'status': 'now_playing',
                    'synopsis': 'Popular nos cinemas.',
                    'poster_image': 'https://image.tmdb.org/t/p/w780/now-playing.jpg',
                    'has_trailer': False,
                }
            ],
            'pagination': {'page': 2, 'page_size': 15, 'has_next': True},
        }

        response = self.client.get('/api/movies/now-playing?page=2')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), mock_get_now_playing_movies.return_value)
        mock_get_now_playing_movies.assert_called_once_with(page=2)


class PopularTvShowsIntegrationTests(APITestCase):
    @patch('movies.views.TMDbMovieService.get_popular_tv_shows')
    def test_popular_tv_shows_endpoint_returns_service_payload(
        self,
        mock_get_popular_tv_shows,
    ):
        mock_get_popular_tv_shows.return_value = {
            'results': [
                {
                    'id': '801',
                    'title': 'Serie Popular',
                    'release_date': '2025-10-01',
                    'status': 'tv_show',
                    'synopsis': 'Serie em destaque.',
                    'poster_image': 'https://image.tmdb.org/t/p/w780/serie.jpg',
                    'has_trailer': False,
                }
            ],
            'pagination': {'page': 4, 'page_size': 15, 'has_next': True},
        }

        response = self.client.get('/api/tv-shows/popular?page=4')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), mock_get_popular_tv_shows.return_value)
        mock_get_popular_tv_shows.assert_called_once_with(page=4)


class MovieCategoriesIntegrationTests(APITestCase):
    @patch('movies.views.TMDbMovieService.get_movie_categories')
    def test_movie_categories_endpoint_returns_service_payload(self, mock_get_movie_categories):
        mock_get_movie_categories.return_value = {
            'results': [
                {'id': '28', 'name': 'Acao'},
                {'id': '18', 'name': 'Drama'},
            ]
        }

        response = self.client.get('/api/movies/categories')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), mock_get_movie_categories.return_value)


class MovieDetailsIntegrationTests(APITestCase):
    @patch('movies.views.TMDbMovieService.get_movie_details')
    def test_movie_details_endpoint_returns_service_payload(self, mock_get_movie_details):
        mock_get_movie_details.return_value = {
            'id': '101',
            'title': 'The Odyssey',
            'synopsis': 'Uma nova adaptacao epica.',
            'release_date': '2026-07-17',
            'runtime': 164,
            'genres': ['Sci-Fi', 'Adventure'],
            'status': 'Released',
            'vote_average': 7.3,
            'poster_image': 'https://image.tmdb.org/t/p/w780/poster.jpg',
            'backdrop_image': 'https://image.tmdb.org/t/p/w1280/backdrop.jpg',
            'images': ['https://image.tmdb.org/t/p/w780/img-1.jpg'],
            'cast': [
                {
                    'id': '501',
                    'name': 'Matt Damon',
                    'character': 'Ryland Grace',
                    'profile_image': 'https://image.tmdb.org/t/p/w300/cast-1.jpg',
                }
            ],
            'directors': [
                {
                    'id': '777',
                    'name': 'Christopher Nolan',
                    'department': 'Directing',
                    'profile_image': 'https://image.tmdb.org/t/p/w300/director.jpg',
                }
            ],
            'trailer': {
                'name': 'Trailer oficial',
                'youtube_key': 'trailer123',
                'embed_url': 'https://www.youtube.com/embed/trailer123',
            },
        }

        response = self.client.get('/api/movies/101')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), mock_get_movie_details.return_value)

    @patch('movies.views.TMDbMovieService.get_movie_details')
    def test_movie_details_endpoint_returns_503_when_service_fails(
        self,
        mock_get_movie_details,
    ):
        mock_get_movie_details.side_effect = MovieServiceError('Filme nao encontrado.')

        response = self.client.get('/api/movies/999999')

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json(), {'detail': 'Filme nao encontrado.'})


class TvShowDetailsIntegrationTests(APITestCase):
    @patch('movies.views.TMDbMovieService.get_tv_show_details')
    def test_tv_show_details_endpoint_returns_service_payload(self, mock_get_tv_show_details):
        mock_get_tv_show_details.return_value = {
            'id': '85552',
            'title': 'Silo',
            'synopsis': 'Uma serie distopica.',
            'release_date': '2023-05-04',
            'runtime': 49,
            'genres': ['Drama', 'Sci-Fi'],
            'status': 'Serie em andamento',
            'vote_average': 8.2,
            'poster_image': 'https://image.tmdb.org/t/p/w780/tv-poster.jpg',
            'backdrop_image': 'https://image.tmdb.org/t/p/w1280/tv-backdrop.jpg',
            'images': ['https://image.tmdb.org/t/p/w780/tv-img-1.jpg'],
            'cast': [
                {
                    'id': '501',
                    'name': 'Rebecca Ferguson',
                    'character': 'Juliette',
                    'profile_image': 'https://image.tmdb.org/t/p/w300/tv-cast.jpg',
                }
            ],
            'creators': [
                {
                    'id': '123',
                    'name': 'Graham Yost',
                    'department': 'Writing',
                    'profile_image': 'https://image.tmdb.org/t/p/w300/creator.jpg',
                }
            ],
            'trailer': {
                'name': 'Trailer oficial',
                'youtube_key': 'silo123',
                'embed_url': 'https://www.youtube.com/embed/silo123',
            },
            'number_of_seasons': 2,
            'number_of_episodes': 20,
            'production_companies': ['AMC Studios'],
        }

        response = self.client.get('/api/tv-shows/85552')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), mock_get_tv_show_details.return_value)


class PersonDetailsIntegrationTests(APITestCase):
    @patch('movies.views.TMDbMovieService.get_person_details')
    def test_person_details_endpoint_returns_service_payload(self, mock_get_person_details):
        mock_get_person_details.return_value = {
            'id': '777',
            'name': 'Christopher Nolan',
            'biography': 'Biografia resumida.',
            'known_for_department': 'Directing',
            'birthday': '1970-07-30',
            'place_of_birth': 'London, England, UK',
            'profile_image': 'https://image.tmdb.org/t/p/w780/person.jpg',
            'top_works': [
                {
                    'id': '101',
                    'title': 'Inception',
                    'release_date': '2010-07-16',
                    'media_type': 'movie',
                    'poster_image': 'https://image.tmdb.org/t/p/w780/inception.jpg',
                    'credit': 'Director',
                }
            ],
            'credits': [
                {
                    'id': '101',
                    'title': 'Inception',
                    'release_date': '2010-07-16',
                    'media_type': 'movie',
                    'poster_image': 'https://image.tmdb.org/t/p/w780/inception.jpg',
                    'credit': 'Director',
                }
            ],
        }

        response = self.client.get('/api/people/777')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), mock_get_person_details.return_value)

    @patch('movies.views.TMDbMovieService.get_person_details')
    def test_person_details_endpoint_returns_503_when_service_fails(
        self,
        mock_get_person_details,
    ):
        mock_get_person_details.side_effect = MovieServiceError('Pessoa nao encontrada.')

        response = self.client.get('/api/people/999999')

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.json(), {'detail': 'Pessoa nao encontrada.'})


class PopularPeopleIntegrationTests(APITestCase):
    @patch('movies.views.TMDbMovieService.get_popular_actors')
    def test_popular_actors_endpoint_returns_service_payload(self, mock_get_popular_actors):
        mock_get_popular_actors.return_value = {
            'results': [
                {
                    'id': '111',
                    'name': 'Actor Example',
                    'known_for_department': 'Acting',
                    'profile_image': 'https://image.tmdb.org/t/p/w300/actor.jpg',
                    'known_for_titles': ['Film A'],
                }
            ],
            'pagination': {'page': 2, 'page_size': 15, 'has_next': True},
        }

        response = self.client.get('/api/people/actors?page=2')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), mock_get_popular_actors.return_value)
        mock_get_popular_actors.assert_called_once_with(page=2)

    @patch('movies.views.TMDbMovieService.get_popular_directors')
    def test_popular_directors_endpoint_returns_service_payload(
        self,
        mock_get_popular_directors,
    ):
        mock_get_popular_directors.return_value = {
            'results': [
                {
                    'id': '222',
                    'name': 'Director Example',
                    'known_for_department': 'Directing',
                    'profile_image': 'https://image.tmdb.org/t/p/w300/director.jpg',
                    'known_for_titles': ['Film B'],
                }
            ],
            'pagination': {'page': 3, 'page_size': 15, 'has_next': False},
        }

        response = self.client.get('/api/people/directors?page=3')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), mock_get_popular_directors.return_value)
        mock_get_popular_directors.assert_called_once_with(page=3)
