import { useState } from 'react'

import { useAuth } from '../auth/AuthContext'

export function FavoriteToggleButton({
  tmdbId,
  mediaType,
  activeLabel = 'Remover dos favoritos',
  inactiveLabel = 'Salvar nos favoritos',
}) {
  const { authenticated, favoritesLoaded, openAuthModal, toggleFavorite, user, isFavorite } =
    useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')

  const active = isFavorite(tmdbId, mediaType)
  const isDisabled = isSubmitting || (authenticated && !favoritesLoaded)

  async function handleClick() {
    setFeedbackMessage('')

    if (!authenticated) {
      setFeedbackMessage('Entre para salvar favoritos.')
      openAuthModal('login')
      return
    }

    if (!user.is_email_verified) {
      setFeedbackMessage('Verifique seu e-mail antes de favoritar.')
      return
    }

    setIsSubmitting(true)

    try {
      await toggleFavorite({ tmdbId, mediaType })
    } catch (error) {
      setFeedbackMessage(error.message || 'Nao foi possivel atualizar seus favoritos.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="favorite-action">
      <button
        type="button"
        className={`button-link ${active ? 'primary' : ''}`.trim()}
        onClick={handleClick}
        disabled={isDisabled}
      >
        {isSubmitting
          ? 'Atualizando...'
          : authenticated && !favoritesLoaded
            ? 'Carregando...'
            : active
              ? activeLabel
              : inactiveLabel}
      </button>

      {feedbackMessage ? <p className="favorite-action__feedback">{feedbackMessage}</p> : null}
    </div>
  )
}
