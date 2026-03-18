const STATUS_LABELS = {
  trending: 'Trending',
  now_playing: 'Em cartaz',
  upcoming: 'Upcoming',
}

export function formatMovieStatus(status) {
  return STATUS_LABELS[status] ?? status ?? ''
}
