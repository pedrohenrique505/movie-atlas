import os
from pathlib import Path

import dj_database_url
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')


def get_env(*names, default=None):
    for name in names:
        value = os.getenv(name)
        if value not in (None, ''):
            return value
    return default


def get_bool_env(*names, default=False):
    value = get_env(*names)
    if value is None:
        return default
    return value.lower() in {'1', 'true', 't', 'yes', 'on'}

SECRET_KEY = 'django-insecure-ij5nf8b*8p+d-jovfe&9u0qf*zg@qlmv_%rb(hmtg!3971%oa('
DEBUG = True
ALLOWED_HOSTS = ['localhost', '127.0.0.1']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',
    'rest_framework',
    'drf_spectacular',
    'core',
    'movies',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

database_url = get_env('DATABASE_URL')
postgres_env_configured = any(
    get_env(name)
    for name in (
        'POSTGRES_DB',
        'POSTGRES_NAME',
        'PGDATABASE',
        'POSTGRES_USER',
        'PGUSER',
        'POSTGRES_HOST',
        'PGHOST',
    )
)

if database_url:
    DATABASES = {
        'default': dj_database_url.parse(
            database_url,
            conn_max_age=int(get_env('DB_CONN_MAX_AGE', default='60')),
            ssl_require=get_bool_env('DB_SSL_REQUIRE', default=False),
        )
    }
elif postgres_env_configured:
    default_database = {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': get_env('POSTGRES_DB', 'POSTGRES_NAME', 'PGDATABASE', default='movie_atlas'),
        'USER': get_env('POSTGRES_USER', 'PGUSER', default='postgres'),
        'PASSWORD': get_env('POSTGRES_PASSWORD', 'PGPASSWORD', default='postgres'),
        'HOST': get_env('POSTGRES_HOST', 'PGHOST', default='127.0.0.1'),
        'PORT': get_env('POSTGRES_PORT', 'PGPORT', default='5432'),
        'CONN_MAX_AGE': int(get_env('DB_CONN_MAX_AGE', default='60')),
    }
    postgres_sslmode = get_env('POSTGRES_SSLMODE', 'PGSSLMODE')
    if postgres_sslmode:
        default_database['OPTIONS'] = {'sslmode': postgres_sslmode}

    DATABASES = {'default': default_database}
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Sao_Paulo'

USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]

REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'Movie Atlas API',
    'DESCRIPTION': 'Base inicial da API REST para a plataforma Movie Atlas.',
    'VERSION': '0.1.0',
}
