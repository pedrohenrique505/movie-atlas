import { useState } from 'react'

import { HorizontalScroller } from './HorizontalScroller'
import { ImageModal } from './ImageModal'

export function MovieMediaGallery({ title, backdropImage, images }) {
  const galleryImages = [backdropImage, ...(images ?? [])].filter(Boolean)
  const [selectedImage, setSelectedImage] = useState(null)

  function buildHighResolutionUrl(imageUrl) {
    return imageUrl
      ?.replace('/w780/', '/original/')
      ?.replace('/w1280/', '/original/')
      ?? imageUrl
  }

  if (!galleryImages.length) {
    return <p className="status-panel">Nenhuma imagem disponível.</p>
  }

  return (
    <section className="details-section" aria-label="Imagens">
      <HorizontalScroller title="Imagens" labelledBy="movie-images">
        {galleryImages.map((imageUrl, index) => (
          <div key={`${imageUrl}-${index}`} className="horizontal-slide" role="listitem">
            <button
              type="button"
              className="details-image-button"
              onClick={() => setSelectedImage(buildHighResolutionUrl(imageUrl))}
            >
              <img
                className="details-image-card"
                src={imageUrl}
                alt={`${title} imagem ${index + 1}`}
              />
            </button>
          </div>
        ))}
      </HorizontalScroller>

      <ImageModal
        isOpen={Boolean(selectedImage)}
        imageUrl={selectedImage}
        alt={`Imagem ampliada de ${title}`}
        onClose={() => setSelectedImage(null)}
      />
    </section>
  )
}
