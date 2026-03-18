import { HorizontalScroller } from './HorizontalScroller'

export function MovieMediaGallery({ title, backdropImage, images }) {
  const galleryImages = [backdropImage, ...(images ?? [])].filter(Boolean)

  if (!galleryImages.length) {
    return <p className="status-panel">Nenhuma imagem disponivel.</p>
  }

  return (
    <section className="details-section" aria-label="Imagens">
      <HorizontalScroller title="Imagens" labelledBy="movie-images">
        {galleryImages.map((imageUrl, index) => (
          <div key={`${imageUrl}-${index}`} className="horizontal-slide" role="listitem">
            <img
              className="details-image-card"
              src={imageUrl}
              alt={`${title} imagem ${index + 1}`}
            />
          </div>
        ))}
      </HorizontalScroller>
    </section>
  )
}
