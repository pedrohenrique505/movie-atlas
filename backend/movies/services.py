import json
import math
import os
from dataclasses import dataclass
from datetime import date
from urllib import error, parse, request

from django.utils import timezone


class MovieServiceError(Exception):
    pass


NON_SCRIPTED_TV_GENRE_IDS = {
    10763,  # News
    10764,  # Reality
    10767,  # Talk
}


PRODUCTION_STATUS_LABELS = {
    'released': 'Lançado',
    'post production': 'Pós-produção',
    'in production': 'Em produção',
    'planned': 'Planejado',
    'rumored': 'Rumor',
    'canceled': 'Cancelado',
    'cancelled': 'Cancelado',
    'ended': 'Encerrado',
    'returning series': 'Série em andamento',
    'pilot': 'Piloto',
    'unreleased': 'Não lançado',
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

    def get_upcoming_movies(self, page=1):
        return self._get_movie_list(
            '/movie/upcoming',
            status_label='upcoming',
            filter_upcoming=True,
            page=page,
        )

    def get_trending_movies(self, page=1):
        return self._get_movie_list('/trending/movie/day', status_label='trending', page=page)

    def get_trending_people(self, page=1):
        normalized_page = self._normalize_page_number(page)
        payload = self._request(
            '/trending/person/day',
            {
                'language': self.language,
                'page': normalized_page,
            },
        )
        return self._normalize_people_payload(
            payload,
            page=normalized_page,
            total_pages=payload.get('total_pages'),
        )

    def get_now_playing_movies(self, page=1):
        return self._get_movie_list('/movie/now_playing', status_label='now_playing', page=page)

    def get_popular_movies(self, page=1):
        return self._get_media_list('/movie/popular', status_label='popular', page=page)

    def get_top_rated_movies(self, page=1):
        return self._get_media_list('/movie/top_rated', status_label='top_rated', page=page)

    def get_popular_tv_shows(self, page=1):
        return self._get_media_list(
            '/tv/popular',
            status_label='tv_show',
            title_fields=('name', 'original_name'),
            date_field='first_air_date',
            page=page,
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

    def get_popular_actors(self, page=1):
        return self._get_people_list('Acting', page=page)

    def get_popular_directors(self, page=1):
        return self._get_people_list('Directing', page=page)

    def get_movie_details(self, movie_id):
        payload = self._request(
            f'/movie/{movie_id}',
            {
                'language': self.language,
                'append_to_response': 'videos,images,credits',
                'include_image_language': f'{self.language},null,en',
            },
        )
        watch_providers = self._get_watch_providers('movie', movie_id)
        return self._normalize_movie_details_payload(payload, watch_providers)

    def get_tv_show_details(self, tv_show_id):
        payload = self._request(
            f'/tv/{tv_show_id}',
            {
                'language': self.language,
                'append_to_response': 'videos,images,aggregate_credits,credits',
                'include_image_language': f'{self.language},null,en',
            },
        )
        watch_providers = self._get_watch_providers('tv', tv_show_id)
        return self._normalize_tv_show_details_payload(payload, watch_providers)

    def search_movies(self, query):
        if not query.strip():
            return {'results': []}

        payload = self._request(
            '/search/multi',
            {
                'language': self.language,
                'query': query.strip(),
                'page': 1,
                'include_adult': 'false',
            },
        )

        return self._normalize_search_payload(payload)

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

    def _get_movie_list(self, path, status_label, filter_upcoming=False, page=1):
        return self._get_media_list(
            path,
            status_label=status_label,
            filter_upcoming=filter_upcoming,
            page=page,
        )

    def _get_media_list(
        self,
        path,
        status_label,
        filter_upcoming=False,
        title_fields=('title', 'original_title'),
        date_field='release_date',
        page=1,
    ):
        normalized_page = self._normalize_page_number(page)
        params = {
            'language': self.language,
            'page': normalized_page,
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
            page=normalized_page,
            total_pages=payload.get('total_pages'),
        )

    def _normalize_media_list_payload(
        self,
        payload,
        status_label,
        filter_upcoming=False,
        title_fields=('title', 'original_title'),
        date_field='release_date',
        page=1,
        total_pages=None,
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
                    'synopsis': item.get('overview') or 'Sinopse ainda não disponível.',
                    'poster_image': self._build_image_url(item.get('poster_path'), 'w780'),
                    'has_trailer': False,
                }
            )

            if len(results) >= self.page_size:
                break

        return {
            'results': results,
            'pagination': {
                'page': page,
                'page_size': self.page_size,
                'has_next': bool(total_pages and page < total_pages),
            },
        }

    def _normalize_search_payload(self, payload):
        results = []

        for item in payload.get('results', []):
            media_type = item.get('media_type')

            if media_type == 'person':
                results.append(
                    {
                        'id': str(item['id']),
                        'media_type': 'person',
                        'name': item.get('name') or '',
                        'known_for_department': item.get('known_for_department') or '',
                        'profile_image': self._build_image_url(item.get('profile_path'), 'w300'),
                        'known_for_titles': self._normalize_known_for_titles(item.get('known_for', [])),
                    }
                )
            elif media_type in {'movie', 'tv'}:
                results.append(
                    {
                        'id': str(item['id']),
                        'media_type': media_type,
                        'title': self._pick_first_value(
                            item,
                            ('title', 'name', 'original_title', 'original_name'),
                        ),
                        'release_date': item.get('release_date') or item.get('first_air_date') or '',
                        'status': 'search_result',
                        'synopsis': item.get('overview') or 'Sinopse ainda não disponível.',
                        'poster_image': self._build_image_url(item.get('poster_path'), 'w780'),
                        'has_trailer': False,
                    }
                )

            if len(results) >= self.page_size:
                break

        return {
            'results': results,
            'pagination': {
                'page': 1,
                'page_size': self.page_size,
                'has_next': False,
            },
        }

    def _get_people_list(self, department, page=1):
        normalized_page = self._normalize_page_number(page)
        slice_start = (normalized_page - 1) * self.page_size
        slice_end = slice_start + self.page_size + 1
        filtered_people = []
        seen_ids = set()
        tmdb_page = 1
        total_pages = None

        while len(filtered_people) < slice_end:
            payload = self._request(
                '/person/popular',
                {
                    'language': self.language,
                    'page': tmdb_page,
                },
            )

            total_pages = payload.get('total_pages') or total_pages
            results = payload.get('results', [])

            for item in results:
                if item.get('known_for_department') != department:
                    continue
                person_id = str(item['id'])
                if person_id in seen_ids:
                    continue
                seen_ids.add(person_id)

                filtered_people.append(
                    {
                        'id': person_id,
                        'name': item.get('name') or '',
                        'known_for_department': item.get('known_for_department') or '',
                        'profile_image': self._build_image_url(item.get('profile_path'), 'w300'),
                        'known_for_titles': self._normalize_known_for_titles(
                            item.get('known_for', [])
                        ),
                    }
                )

                if len(filtered_people) >= slice_end:
                    break

            if not results or (total_pages and tmdb_page >= total_pages):
                break
            tmdb_page += 1

        page_results = filtered_people[slice_start:slice_start + self.page_size]
        has_next = len(filtered_people) > slice_start + self.page_size

        return {
            'results': page_results,
            'pagination': {
                'page': normalized_page,
                'page_size': self.page_size,
                'has_next': has_next,
            },
        }

    def _normalize_people_payload(self, payload, page=1, total_pages=None):
        results = []
        seen_ids = set()

        for item in payload.get('results', []):
            person_id = str(item.get('id') or '')
            if not person_id or person_id in seen_ids:
                continue

            seen_ids.add(person_id)
            results.append(
                {
                    'id': person_id,
                    'name': item.get('name') or '',
                    'known_for_department': item.get('known_for_department') or '',
                    'profile_image': self._build_image_url(item.get('profile_path'), 'w300'),
                    'known_for_titles': self._normalize_known_for_titles(item.get('known_for', [])),
                }
            )

            if len(results) >= self.page_size:
                break

        return {
            'results': results,
            'pagination': {
                'page': page,
                'page_size': self.page_size,
                'has_next': bool(total_pages and page < total_pages),
            },
        }

    def _normalize_movie_details_payload(self, payload, watch_providers=None):
        videos = payload.get('videos', {}).get('results', [])
        images = payload.get('images', {})
        credits = payload.get('credits', {})
        normalized_videos = self._normalize_videos(videos)
        trailer = self._pick_trailer(videos)

        return {
            'id': str(payload['id']),
            'title': payload.get('title') or payload.get('original_title') or '',
            'synopsis': payload.get('overview') or 'Sinopse ainda não disponível.',
            'release_date': payload.get('release_date') or '',
            'runtime': payload.get('runtime'),
            'genres': [genre.get('name') for genre in payload.get('genres', []) if genre.get('name')],
            'status': self._normalize_production_status(payload.get('status')),
            'vote_average': self._normalize_vote_average(payload.get('vote_average')),
            'poster_image': self._build_image_url(payload.get('poster_path'), 'w780'),
            'backdrop_image': self._build_image_url(payload.get('backdrop_path'), 'w1280'),
            'images': self._normalize_images(images),
            'media': {
                'backdrops': self._normalize_image_group(images.get('backdrops', []), 'w1280'),
                'posters': self._normalize_image_group(images.get('posters', []), 'w780'),
                'videos': normalized_videos,
            },
            'cast': self._normalize_cast(credits),
            'directors': self._normalize_directors(credits),
            'trailer': trailer,
            'watch_providers': watch_providers or self._empty_watch_providers(),
        }

    def _normalize_tv_show_details_payload(self, payload, watch_providers=None):
        videos = payload.get('videos', {}).get('results', [])
        images = payload.get('images', {})
        aggregate_credits = payload.get('aggregate_credits', {})
        credits = payload.get('credits', {})
        normalized_videos = self._normalize_videos(videos)
        trailer = self._pick_trailer(videos)

        return {
            'id': str(payload['id']),
            'title': payload.get('name') or payload.get('original_name') or '',
            'synopsis': payload.get('overview') or 'Sinopse ainda não disponível.',
            'release_date': payload.get('first_air_date') or '',
            'runtime': self._pick_episode_runtime(payload.get('episode_run_time', [])),
            'genres': [genre.get('name') for genre in payload.get('genres', []) if genre.get('name')],
            'status': self._normalize_production_status(payload.get('status')),
            'vote_average': self._normalize_vote_average(payload.get('vote_average')),
            'poster_image': self._build_image_url(payload.get('poster_path'), 'w780'),
            'backdrop_image': self._build_image_url(payload.get('backdrop_path'), 'w1280'),
            'images': self._normalize_images(images),
            'media': {
                'backdrops': self._normalize_image_group(images.get('backdrops', []), 'w1280'),
                'posters': self._normalize_image_group(images.get('posters', []), 'w780'),
                'videos': normalized_videos,
            },
            'cast': self._normalize_tv_cast(aggregate_credits, credits),
            'creators': self._normalize_creators(payload, credits),
            'trailer': trailer,
            'number_of_seasons': payload.get('number_of_seasons'),
            'number_of_episodes': payload.get('number_of_episodes'),
            'production_companies': [
                company.get('name')
                for company in payload.get('production_companies', [])
                if company.get('name')
            ],
            'watch_providers': watch_providers or self._empty_watch_providers(),
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

    def _normalize_tv_cast(self, aggregate_credits_payload, credits_payload):
        cast = []
        raw_cast = aggregate_credits_payload.get('cast') or credits_payload.get('cast') or []

        for person in raw_cast[:15]:
            roles = person.get('roles') or []
            character = person.get('character') or ''
            if not character and roles:
                character = roles[0].get('character') or ''

            cast.append(
                {
                    'id': str(person['id']),
                    'name': person.get('name') or '',
                    'character': character,
                    'profile_image': self._build_image_url(person.get('profile_path'), 'w300'),
                }
            )

        return cast

    def _normalize_creators(self, payload, credits_payload):
        creators = []
        crew_lookup = {
            str(person['id']): person
            for person in credits_payload.get('crew', [])
            if person.get('id') is not None
        }

        for person in payload.get('created_by', []):
            person_id = str(person['id'])
            crew_person = crew_lookup.get(person_id, {})
            creators.append(
                {
                    'id': person_id,
                    'name': person.get('name') or '',
                    'department': crew_person.get('known_for_department')
                    or crew_person.get('department')
                    or 'Creator',
                    'profile_image': self._build_image_url(
                        person.get('profile_path') or crew_person.get('profile_path'),
                        'w300',
                    ),
                }
            )

        if creators:
            return creators[:5]

        fallback_creators = []
        for person in credits_payload.get('crew', []):
            if person.get('job') not in {'Creator', 'Executive Producer', 'Director'}:
                continue

            fallback_creators.append(
                {
                    'id': str(person['id']),
                    'name': person.get('name') or '',
                    'department': person.get('known_for_department')
                    or person.get('department')
                    or person.get('job')
                    or 'Creator',
                    'profile_image': self._build_image_url(person.get('profile_path'), 'w300'),
                }
            )

        unique_creators = []
        seen_ids = set()
        for creator in fallback_creators:
            if creator['id'] in seen_ids:
                continue
            seen_ids.add(creator['id'])
            unique_creators.append(creator)

        return unique_creators[:5]

    def _normalize_person_details_payload(self, payload):
        birthday = payload.get('birthday') or ''
        credits = self._normalize_person_credits(payload.get('combined_credits', {}))

        return {
            'id': str(payload['id']),
            'name': payload.get('name') or '',
            'biography': payload.get('biography') or 'Biografia ainda não disponível.',
            'known_for_department': payload.get('known_for_department') or '',
            'birthday': birthday,
            'place_of_birth': payload.get('place_of_birth') or '',
            'profile_image': self._build_image_url(payload.get('profile_path'), 'w780'),
            'top_works': [self._public_person_project(project) for project in self._build_person_top_works(credits)],
            'credits': [self._public_person_project(project) for project in credits],
        }

    def _normalize_known_for_titles(self, known_for_payload):
        titles = []

        for item in known_for_payload:
            title = item.get('title') or item.get('name') or item.get('original_title') or ''
            if title and title not in titles:
                titles.append(title)

        return titles[:3]

    def _normalize_person_credits(self, credits_payload):
        combined = []

        for item in credits_payload.get('cast', []):
            normalized_project = self._normalize_person_project(item, is_cast=True)
            if normalized_project is not None:
                combined.append(normalized_project)

        for item in credits_payload.get('crew', []):
            normalized_project = self._normalize_person_project(item, is_cast=False)
            if normalized_project is not None:
                combined.append(normalized_project)

        latest_projects = {}

        for item in combined:
            if not item['title']:
                continue

            project_key = (item['media_type'], item['id'] or item['title'])
            current_item = latest_projects.get(project_key)

            if current_item is None or self._should_replace_person_project(item, current_item):
                latest_projects[project_key] = item

        return sorted(
            latest_projects.values(),
            key=self._person_project_rank_score,
            reverse=True,
        )

    def _build_person_top_works(self, credits):
        top_works = sorted(
            credits,
            key=self._person_project_rank_score,
            reverse=True,
        )

        return top_works[:12]

    def _public_person_project(self, project):
        return {
            'id': project['id'],
            'title': project['title'],
            'release_date': project['release_date'],
            'media_type': project['media_type'],
            'poster_image': project['poster_image'],
            'credit': project['credit'],
            'popularity': project['popularity'],
            'vote_count': project['vote_count'],
            'order': project['order'],
            'episode_count': project['episode_count'],
        }

    def _normalize_person_project(self, item, is_cast):
        item_id = item.get('id')
        if item_id is None:
            return None

        media_type = item.get('media_type') or 'movie'
        if media_type not in {'movie', 'tv'}:
            return None

        title = item.get('title') or item.get('name') or item.get('original_title') or ''
        if not title:
            return None

        if is_cast:
            credit = item.get('character') or item.get('roles')
        else:
            credit = item.get('job') or item.get('department')

        credit = self._normalize_person_credit_label(credit, is_cast=is_cast)
        if not credit:
            return None

        return {
            'id': str(item_id),
            'title': title,
            'release_date': item.get('release_date') or item.get('first_air_date') or '',
            'media_type': media_type,
            'poster_image': self._build_image_url(item.get('poster_path'), 'w780'),
            'credit': credit,
            'credit_type': 'cast' if is_cast else 'crew',
            'popularity': self._normalize_person_project_popularity(item.get('popularity')),
            'vote_count': self._normalize_person_project_vote_count(item.get('vote_count')),
            'order': self._normalize_person_project_order(item.get('order')),
            'episode_count': self._normalize_person_project_episode_count(item.get('episode_count')),
        }

    def _normalize_person_credit_label(self, credit, is_cast):
        if isinstance(credit, list):
            for entry in credit:
                if not isinstance(entry, dict):
                    continue
                label = entry.get('character') or entry.get('job')
                if label:
                    return label
            return ''

        if isinstance(credit, str):
            return credit.strip()

        return ''

    def _should_replace_person_project(self, candidate, current):
        candidate_score = self._person_project_rank_score(candidate)
        current_score = self._person_project_rank_score(current)
        if candidate_score != current_score:
            return candidate_score > current_score

        if candidate.get('poster_image') and not current.get('poster_image'):
            return True

        return False

    def _normalize_person_project_popularity(self, value):
        if isinstance(value, bool):
            return 0.0

        if isinstance(value, (int, float)):
            return float(value)

        return 0.0

    def _normalize_person_project_vote_count(self, value):
        if isinstance(value, bool):
            return 0

        if isinstance(value, int):
            return value

        if isinstance(value, float):
            return int(value)

        return 0

    def _normalize_person_project_order(self, value):
        if isinstance(value, bool):
            return self.page_size

        if isinstance(value, int):
            return value if value >= 0 else self.page_size

        if isinstance(value, float) and value.is_integer():
            normalized_value = int(value)
            return normalized_value if normalized_value >= 0 else self.page_size

        return self.page_size

    def _normalize_person_project_episode_count(self, value):
        if isinstance(value, bool):
            return 0

        if isinstance(value, int):
            return value if value >= 0 else 0

        if isinstance(value, float) and value.is_integer():
            normalized_value = int(value)
            return normalized_value if normalized_value >= 0 else 0

        return 0

    def _person_project_rank_score(self, project):
        popularity = max(project.get('popularity', 0) or 0, 0)
        raw_order = project.get('order')
        order = 999 if raw_order is None else max(raw_order, 0)
        popularity_score = math.log1p(popularity)
        relevance_score = 1 / (order + 1)

        if project.get('media_type') == 'tv':
            raw_episode_count = project.get('episode_count')
            episode_count = 0 if raw_episode_count is None else max(raw_episode_count, 0)
            episode_bonus = 1 + min(math.log1p(episode_count) * 0.15, 0.5)
            return popularity_score * relevance_score * episode_bonus

        return popularity_score * relevance_score

    def _normalize_images(self, images_payload):
        image_paths = []

        for key in ('backdrops', 'posters'):
            for item in images_payload.get(key, []):
                image_url = self._build_image_url(item.get('file_path'), 'w780')
                if image_url and image_url not in image_paths:
                    image_paths.append(image_url)

        return image_paths[:6]

    def _normalize_image_group(self, images_payload, size):
        normalized_images = []
        seen_paths = set()

        for item in images_payload:
            file_path = item.get('file_path')
            if not file_path or file_path in seen_paths:
                continue

            seen_paths.add(file_path)
            normalized_images.append(
                {
                    'preview_image': self._build_image_url(file_path, size),
                    'full_image': self._build_image_url(file_path, 'original'),
                }
            )

        return normalized_images[:10]

    def _normalize_videos(self, videos_payload):
        normalized_videos = []
        seen_keys = set()

        for video in videos_payload:
            if video.get('site') != 'YouTube' or not video.get('key'):
                continue

            video_key = video.get('key')
            if video_key in seen_keys:
                continue

            seen_keys.add(video_key)
            normalized_videos.append(
                {
                    'name': video.get('name') or 'Vídeo',
                    'type': video.get('type') or 'Video',
                    'youtube_key': video_key,
                    'embed_url': f'https://www.youtube.com/embed/{video_key}',
                    'thumbnail_image': f'https://img.youtube.com/vi/{video_key}/hqdefault.jpg',
                }
            )

        normalized_videos.sort(
            key=lambda item: (
                item['type'] != 'Trailer',
                item['type'] != 'Teaser',
                item['name'],
            )
        )

        return normalized_videos[:10]

    def _get_watch_providers(self, media_type, media_id):
        payload = self._request(f'/{media_type}/{media_id}/watch/providers', {})
        return self._normalize_watch_providers(payload)

    def _normalize_watch_providers(self, payload):
        results = payload.get('results', {})
        region_payload = results.get(self.region) or results.get('US') or {}
        link = region_payload.get('link')

        categories = []
        for source_key, label in (
            ('flatrate', 'Streaming'),
            ('rent', 'Aluguel'),
            ('buy', 'Compra'),
        ):
            providers = self._normalize_watch_provider_items(region_payload.get(source_key, []), link)
            if providers:
                categories.append(
                    {
                        'key': source_key,
                        'label': label,
                        'providers': providers,
                    }
                )

        return {
            'link': link,
            'categories': categories,
        }

    def _normalize_watch_provider_items(self, providers_payload, link):
        providers = []
        seen_ids = set()

        for provider in providers_payload:
            provider_id = provider.get('provider_id')
            if provider_id in seen_ids:
                continue

            seen_ids.add(provider_id)
            providers.append(
                {
                    'id': str(provider_id),
                    'name': provider.get('provider_name') or '',
                    'logo_image': self._build_image_url(provider.get('logo_path'), 'w300'),
                    'link': link,
                }
            )

        return providers

    def _empty_watch_providers(self):
        return {'link': None, 'categories': []}

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

    def _pick_episode_runtime(self, runtimes):
        if not runtimes:
            return None
        return runtimes[0] or None

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

    def _normalize_page_number(self, value):
        try:
            page = int(value)
        except (TypeError, ValueError):
            return 1

        return page if page > 0 else 1
