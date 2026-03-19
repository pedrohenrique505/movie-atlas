import { useEffect, useMemo, useState } from 'react'

import { HorizontalScroller } from './HorizontalScroller'
import { ImageModal } from './ImageModal'
import { MovieTrailer } from './MovieTrailer'

const MEDIA_TABS = [
  { key: 'backdrops', label: 'Backdrops' },
  { key: 'posters', label: 'Posters' },
  { key: 'videos', label: 'Vídeos' },
]

export function MediaPanel({ title, media }) {
  const availableTabs = useMemo(
    () => MEDIA_TABS.filter((tab) => (media?.[tab.key] ?? []).length > 0),
    [media],
  )
  const [activeTab, setActiveTab] = useState(availableTabs[0]?.key ?? 'backdrops')
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedVideo, setSelectedVideo] = useState(null)

  useEffect(() => {
    setActiveTab(availableTabs[0]?.key ?? 'backdrops')
  }, [availableTabs])

  const currentTab = availableTabs.find((tab) => tab.key === activeTab) ?? availableTabs[0]
  const currentItems = currentTab ? media?.[currentTab.key] ?? [] : []

  if (!availableTabs.length) {
    return (
      <section className="details-section" aria-label="Mídia">
        <div className="section-head">
          <div>
            <h2>Mídia</h2>
          </div>
        </div>
        <p className="status-panel">Nenhuma mídia disponível no momento.</p>
      </section>
    )
  }

  return (
    <section className="details-section" aria-label="Mídia">
      <div className="section-head section-head--stacked">
        <div>
          <h2>Mídia</h2>
        </div>

        <div className="media-tabs" role="tablist" aria-label="Categorias de mídia">
          {availableTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.key}
              className={`filter-chip ${activeTab === tab.key ? 'active' : ''}`.trim()}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <HorizontalScroller
        title={currentTab.label}
        labelledBy={`media-panel-${currentTab.key}`}
        className="media-panel__scroller"
      >
        {currentTab.key === 'videos'
          ? currentItems.map((video) => (
              <div key={video.youtube_key} className="horizontal-slide" role="listitem">
                <button
                  type="button"
                  className="media-card media-card--video"
                  onClick={() => setSelectedVideo(video)}
                >
                  {video.thumbnail_image ? (
                    <img
                      className="media-card__image"
                      src={video.thumbnail_image}
                      alt={`Miniatura de ${video.name}`}
                    />
                  ) : (
                    <div className="media-card__fallback" aria-hidden="true">
                      <span>YT</span>
                    </div>
                  )}
                  <span className="media-card__pill">Assistir</span>
                  <div className="media-card__content">
                    <h3>{video.name}</h3>
                    <p>{video.type}</p>
                  </div>
                </button>
              </div>
            ))
          : currentItems.map((image, index) => (
              <div
                key={`${currentTab.key}-${image.full_image ?? image.preview_image}-${index}`}
                className="horizontal-slide"
                role="listitem"
              >
                <button
                  type="button"
                  className="media-card"
                  onClick={() => setSelectedImage(image.full_image ?? image.preview_image)}
                >
                  {image.preview_image ? (
                    <img
                      className="media-card__image"
                      src={image.preview_image}
                      alt={`${title} ${currentTab.label.toLowerCase()} ${index + 1}`}
                    />
                  ) : (
                    <div className="media-card__fallback" aria-hidden="true">
                      <span>{title.slice(0, 2).toUpperCase()}</span>
                    </div>
                  )}
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

      <MovieTrailer
        trailer={selectedVideo}
        isOpen={Boolean(selectedVideo)}
        onClose={() => setSelectedVideo(null)}
      />
    </section>
  )
}
