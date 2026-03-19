export function WatchAvailabilityButton({ link, className = '' }) {
  const buttonClassName = ['button-link', 'watch-availability-button', className]
    .filter(Boolean)
    .join(' ')

  return link ? (
    <a
      className={buttonClassName}
      href={link}
      target="_blank"
      rel="noreferrer"
    >
      Onde posso assistir?
    </a>
  ) : (
    <button
      type="button"
      className={`${buttonClassName} button-link--disabled`.trim()}
      disabled
    >
      Onde posso assistir?
    </button>
  )
}
