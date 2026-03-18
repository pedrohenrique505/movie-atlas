const STATUS_LABELS = {
  trending: 'Em alta',
  now_playing: 'Em cartaz',
  upcoming: 'Próximos lançamentos',
  popular: 'Populares',
  tv_show: 'Série',
  search_result: 'Resultado da busca',
}

const DEPARTMENT_LABELS = {
  Acting: 'Atuação',
  Directing: 'Direção',
}

const MEDIA_TYPE_LABELS = {
  movie: 'Filme',
  tv: 'Série',
}

export function formatMovieStatus(status) {
  return STATUS_LABELS[status] ?? status ?? ''
}

export function formatDepartmentLabel(department) {
  return DEPARTMENT_LABELS[department] ?? department ?? ''
}

export function formatMediaTypeLabel(mediaType) {
  return MEDIA_TYPE_LABELS[mediaType] ?? mediaType ?? ''
}
