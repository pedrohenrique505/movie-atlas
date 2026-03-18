import { useEffect } from 'react'

import { CloseIcon } from './navigation/CloseIcon'

export function MovieTrailer({ trailer, isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!trailer?.embed_url || !isOpen) {
    return null
  }

  return (
    <div className="trailer-modal" role="dialog" aria-modal="true" aria-label={trailer.name || 'Trailer'}>
      <div className="trailer-modal__backdrop" onClick={onClose} aria-hidden="true" />

      <div className="trailer-modal__content">
        <div className="section-head">
          <div>
            <h2>{trailer.name || 'Trailer'}</h2>
          </div>

          <button
            type="button"
            className="carousel-button"
            onClick={onClose}
            aria-label="Fechar trailer"
          >
            <CloseIcon />
          </button>
        </div>

        <div className="trailer-frame">
          <iframe
            src={trailer.embed_url}
            title={trailer.name || 'Trailer do filme'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </div>
    </div>
  )
}
