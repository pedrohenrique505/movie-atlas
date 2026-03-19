const DATE_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

export function formatDateBR(value) {
  if (!value) {
    return ''
  }

  const normalizedDate = new Date(`${value}T00:00:00`)

  if (Number.isNaN(normalizedDate.getTime())) {
    return value
  }

  return DATE_FORMATTER.format(normalizedDate)
}
