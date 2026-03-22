import { useState } from 'react'

import { useAuth } from '../auth/AuthContext'
import { FavoriteIcon } from './navigation/FavoriteIcon'

export function FavoriteToggleButton({
  tmdbId,
  mediaType,
  variant = 'button',
  activeLabel = 'Remover dos favoritos',
  inactiveLabel = 'Salvar nos favoritos',
  activeTooltip = activeLabel,
  inactiveTooltip = 'Adicionar aos favoritos',
}) {
  const { authenticated, favoritesLoaded, openAuthModal, toggleFavorite, user, isFavorite } =
    useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')

  const active = isFavorite(tmdbId, mediaType)
  const isDisabled = isSubmitting || (authenticated && !favoritesLoaded)
  const isIconVariant = variant === 'icon'
  const tooltip = isSubmitting
    ? 'Atualizando favoritos'
    : authenticated && !favoritesLoaded
      ? 'Carregando favoritos'
      : active
        ? activeTooltip
        : inactiveTooltip

  async function handleClick(event) {
    event.preventDefault()
    event.stopPropagation()
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
    <div className={`favorite-action ${isIconVariant ? 'favorite-action--icon' : ''}`.trim()}>
      <button
        type="button"
        className={
          isIconVariant
            ? `favorite-button ${active ? 'favorite-button--active' : ''}`.trim()
            : `button-link ${active ? 'primary' : ''}`.trim()
        }
        onClick={handleClick}
        disabled={isDisabled}
        title={tooltip}
        aria-label={tooltip}
      >
        {isIconVariant ? (
          <>
            <FavoriteIcon active={active} />
            <span className="sr-only">{tooltip}</span>
          </>
        ) : isSubmitting ? (
          'Atualizando...'
        ) : authenticated && !favoritesLoaded ? (
          'Carregando...'
        ) : active ? (
          activeLabel
        ) : (
          inactiveLabel
        )}
      </button>

      {feedbackMessage ? <p className="favorite-action__feedback">{feedbackMessage}</p> : null}
    </div>
  )
}
