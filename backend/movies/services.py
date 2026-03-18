import json
import os
from dataclasses import dataclass
from datetime import date
from urllib import error, parse, request

from django.utils import timezone


class MovieServiceError(Exception):
    pass


PRODUCTION_STATUS_LABELS = {
    'released': 'Lancado',
    'post production': 'Pos-producao',
    'in production': 'Em producao',
    'planned': 'Planejado',
    'rumored': 'Rumor',
    'canceled': 'Cancelado',
    'cancelled': 'Cancelado',
    'ended': 'Encerrado',
    'returning series': 'Serie em andamento',
    'pilot': 'Piloto',
    'unreleased': 'Nao lancado',
}


@dataclass
class TMDbMovieService:
    base_url: str = 'https://api.themoviedb.org/3'
    image_base_url: str = 'https://image.tmdb.org/t/p'
    timeout: int = 10
    language: str = 'pt-BR'
    region: str = 'BR'
    page_size: int = 15

    @property
    def api_token(self):
        return os.getenv('TMDB_API_READ_ACCESS_TOKEN', '').strip()

    def get_upcoming_movies(self):
        return self._get_movie_list(
            '/movie/upcoming',
            status_label='upcoming',
            filter_upcoming=True,
        )

    def get_trending_movies(self):
        return self._get_movie_list('/trending/movie/day', status_label='trending')

    def get_now_playing_movies(self):
        return self._get_movie_list('/movie/now_playing', status_label='now_playing')

    def get_popular_movies(self):
        return self._get_media_list('/movie/popular', status_label='popular')

    def get_popular_tv_shows(self):
        return self._get_media_list(
            '/tv/popular',
            status_label='tv_show',
            title_fields=('name', 'original_name'),
            date_field='first_air_date',
        )

    def get_movie_categories(self):
        payload = self._request(
            '/genre/movie/list',
            {
                'language': self.language,
            },
        )

        results = [
            {
                'id': str(item['id']),
                'name': item.get('name') or '',
            }
            for item in payload.get('genres', [])
            if item.get('name')
        ]

        return {'results': results}

    def get_popular_actors(self):
        return self._get_people_list('Acting')

    def get_popular_directors(self):
        return self._get_people_list('Directing')

    def get_movie_details(self, movie_id):
        payload = self._request(
            f'/movie/{movie_id}',
            {
                'language': self.language,
                'append_to_response': 'videos,images,credits',
                'include_image_language': f'{self.language},null,en',
            },
        )
        return self._normalize_movie_details_payload(payload)

    def search_movies(self, query):
        if not query.strip():
            return {'results': []}

        payload = self._request(
            '/search/movie',
            {
                'language': self.language,
                'query': query.strip(),
                'page': 1,
                'include_adult': 'false',
            },
        )

        return self._normalize_media_list_payload(
            payload,
            status_label='search_result',
        )

    def get_person_details(self, person_id):
        payload = self._request(
            f'/person/{person_id}',
            {
                'language': self.language,
                'append_to_response': 'combined_credits',
            },
        )
        return self._normalize_person_details_payload(payload)

    def _request(self, path, params):
        if not self.api_token:
            raise MovieServiceError(
                'A variavel de ambiente TMDB_API_READ_ACCESS_TOKEN nao foi configurada.'
            )

        query = parse.urlencode(params)
        url = f'{self.base_url}{path}?{query}'
        api_request = request.Request(
            url,
            headers={
                'Authorization': f'Bearer {self.api_token}',
                'Accept': 'application/json',
            },
            method='GET',
        )

        try:
            with request.urlopen(api_request, timeout=self.timeout) as response:
                return json.loads(response.read().decode('utf-8'))
        except error.HTTPError as exc:
            if exc.code == 404:
                raise MovieServiceError('Filme nao encontrado.') from exc
            raise MovieServiceError(
                f'Falha ao consultar a API externa de filmes: HTTP {exc.code}.'
            ) from exc
        except error.URLError as exc:
            raise MovieServiceError(
                'Falha ao consultar a API externa de filmes.'
            ) from exc

    def _get_movie_list(self, path, status_label, filter_upcoming=False):
        return self._get_media_list(
            path,
            status_label=status_label,
            filter_upcoming=filter_upcoming,
        )

    def _get_media_list(
        self,
        path,
        status_label,
        filter_upcoming=False,
        title_fields=('title', 'original_title'),
        date_field='release_date',
    ):
        params = {
            'language': self.language,
            'page': 1,
        }

        if path in {'/movie/upcoming', '/movie/now_playing'}:
            params['region'] = self.region

        payload = self._request(path, params)

        return self._normalize_media_list_payload(
            payload,
            status_label=status_label,
            filter_upcoming=filter_upcoming,
            title_fields=title_fields,
            date_field=date_field,
        )

    def _normalize_media_list_payload(
        self,
        payload,
        status_label,
        filter_upcoming=False,
        title_fields=('title', 'original_title'),
        date_field='release_date',
    ):
        results = []

        for item in payload.get('results', []):
            release_date = item.get(date_field) or ''

            if filter_upcoming and not self._is_upcoming_release_date(release_date):
                continue

            results.append(
                {
                    'id': str(item['id']),
                    'title': self._pick_first_value(item, title_fields),
                    'release_date': release_date,
                    'status': status_label,
                    'synopsis': item.get('overview') or 'Sinopse ainda nao disponivel.',
                    'poster_image': self._build_image_url(item.get('poster_path'), 'w780'),
                    'has_trailer': False,
                }
            )

            if len(results) >= self.page_size:
                break

        return {'results': results}

    def _get_people_list(self, department):
        results = []

        for page in range(1, 4):
            payload = self._request(
                '/person/popular',
                {
                    'language': self.language,
                    'page': page,
                },
            )

            for item in payload.get('results', []):
                if item.get('known_for_department') != department:
                    continue

                results.append(
                    {
                        'id': str(item['id']),
                        'name': item.get('name') or '',
                        'known_for_department': item.get('known_for_department') or '',
                        'profile_image': self._build_image_url(item.get('profile_path'), 'w300'),
                        'known_for_titles': self._normalize_known_for_titles(
                            item.get('known_for', [])
                        ),
                    }
                )

                if len(results) >= self.page_size:
                    return {'results': results}

            if not payload.get('results'):
                break

        return {'results': results}

    def _normalize_movie_details_payload(self, payload):
        videos = payload.get('videos', {}).get('results', [])
        images = payload.get('images', {})
        credits = payload.get('credits', {})
        trailer = self._pick_trailer(videos)

        return {
            'id': str(payload['id']),
            'title': payload.get('title') or payload.get('original_title') or '',
            'synopsis': payload.get('overview') or 'Sinopse ainda nao disponivel.',
            'release_date': payload.get('release_date') or '',
            'runtime': payload.get('runtime'),
            'genres': [genre.get('name') for genre in payload.get('genres', []) if genre.get('name')],
            'status': self._normalize_production_status(payload.get('status')),
            'vote_average': self._normalize_vote_average(payload.get('vote_average')),
            'poster_image': self._build_image_url(payload.get('poster_path'), 'w780'),
            'backdrop_image': self._build_image_url(payload.get('backdrop_path'), 'w1280'),
            'images': self._normalize_images(images),
            'cast': self._normalize_cast(credits),
            'directors': self._normalize_directors(credits),
            'trailer': trailer,
        }

    def _normalize_cast(self, credits_payload):
        cast = []

        for person in credits_payload.get('cast', [])[:15]:
            cast.append(
                {
                    'id': str(person['id']),
                    'name': person.get('name') or '',
                    'character': person.get('character') or '',
                    'profile_image': self._build_image_url(person.get('profile_path'), 'w300'),
                }
            )

        return cast

    def _normalize_directors(self, credits_payload):
        directors = []

        for person in credits_payload.get('crew', []):
            if person.get('job') != 'Director':
                continue

            directors.append(
                {
                    'id': str(person['id']),
                    'name': person.get('name') or '',
                    'department': person.get('known_for_department')
                    or person.get('department')
                    or 'Directing',
                    'profile_image': self._build_image_url(person.get('profile_path'), 'w300'),
                }
            )

        unique_directors = []
        seen_ids = set()

        for director in directors:
            if director['id'] in seen_ids:
                continue
            seen_ids.add(director['id'])
            unique_directors.append(director)

        return unique_directors[:5]

    def _normalize_person_details_payload(self, payload):
        return {
            'id': str(payload['id']),
            'name': payload.get('name') or '',
            'biography': payload.get('biography') or 'Biografia ainda nao disponivel.',
            'known_for_department': payload.get('known_for_department') or '',
            'birthday': payload.get('birthday') or '',
            'place_of_birth': payload.get('place_of_birth') or '',
            'profile_image': self._build_image_url(payload.get('profile_path'), 'w780'),
            'projects': self._normalize_person_projects(payload.get('combined_credits', {})),
        }

    def _normalize_known_for_titles(self, known_for_payload):
        titles = []

        for item in known_for_payload:
            title = item.get('title') or item.get('name') or item.get('original_title') or ''
            if title and title not in titles:
                titles.append(title)

        return titles[:3]

    def _normalize_person_projects(self, credits_payload):
        combined = []

        for item in credits_payload.get('cast', []):
            combined.append(
                {
                    'id': str(item['id']),
                    'title': item.get('title') or item.get('name') or item.get('original_title') or '',
                    'release_date': item.get('release_date') or item.get('first_air_date') or '',
                    'media_type': item.get('media_type') or 'movie',
                    'credit': item.get('character') or 'Elenco',
                }
            )

        for item in credits_payload.get('crew', []):
            combined.append(
                {
                    'id': str(item['id']),
                    'title': item.get('title') or item.get('name') or item.get('original_title') or '',
                    'release_date': item.get('release_date') or item.get('first_air_date') or '',
                    'media_type': item.get('media_type') or 'movie',
                    'credit': item.get('job') or item.get('department') or 'Equipe',
                }
            )

        filtered = []
        seen = set()

        for item in sorted(
            combined,
            key=lambda project: (
                project['release_date'] != '',
                project['release_date'],
                project['title'],
            ),
            reverse=True,
        ):
            if not item['title']:
                continue

            project_key = (item['id'], item['credit'])
            if project_key in seen:
                continue

            seen.add(project_key)
            filtered.append(item)

        return filtered[:12]

    def _normalize_images(self, images_payload):
        image_paths = []

        for key in ('backdrops', 'posters'):
            for item in images_payload.get(key, []):
                image_url = self._build_image_url(item.get('file_path'), 'w780')
                if image_url and image_url not in image_paths:
                    image_paths.append(image_url)

        return image_paths[:6]

    def _pick_trailer(self, videos):
        youtube_videos = [
            video
            for video in videos
            if video.get('site') == 'YouTube' and video.get('type') in {'Trailer', 'Teaser'}
        ]
        youtube_videos.sort(
            key=lambda video: (
                video.get('type') != 'Trailer',
                not video.get('official', False),
            )
        )

        if not youtube_videos:
            return None

        selected = youtube_videos[0]
        return {
            'name': selected.get('name') or 'Trailer',
            'youtube_key': selected.get('key'),
            'embed_url': f"https://www.youtube.com/embed/{selected.get('key')}",
        }

    def _build_image_url(self, file_path, size):
        if not file_path:
            return None
        return f'{self.image_base_url}/{size}{file_path}'

    def _normalize_vote_average(self, value):
        if value in (None, ''):
            return None
        return round(float(value), 1)

    def _normalize_production_status(self, value):
        if not value:
            return ''

        return PRODUCTION_STATUS_LABELS.get(value.lower(), value)

    def _pick_first_value(self, payload, fields):
        for field in fields:
            value = payload.get(field)
            if value:
                return value
        return ''

    def _is_upcoming_release_date(self, release_date):
        if not release_date:
            return False

        try:
            parsed_release_date = date.fromisoformat(release_date)
        except ValueError:
            return False

        return parsed_release_date >= timezone.localdate()
