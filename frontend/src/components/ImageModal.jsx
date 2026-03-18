import { useEffect } from 'react'

import { CloseIcon } from './navigation/CloseIcon'

export function ImageModal({ isOpen, imageUrl, alt, onClose }) {
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

  if (!isOpen || !imageUrl) {
    return null
  }

  return (
    <div className="image-modal" role="dialog" aria-modal="true" aria-label="Visualizacao de imagem">
      <div className="image-modal__backdrop" onClick={onClose} aria-hidden="true" />

      <div className="image-modal__content">
        <button
          type="button"
          className="carousel-button image-modal__close"
          onClick={onClose}
          aria-label="Fechar imagem"
        >
          <CloseIcon />
        </button>

        <img src={imageUrl} alt={alt} className="image-modal__image" />
      </div>
    </div>
  )
}
