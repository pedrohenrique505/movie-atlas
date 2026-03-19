import { useEffect, useMemo, useState } from 'react'

const TYPING_DELAY_MS = 90
const ERASING_DELAY_MS = 45
const PAUSE_AFTER_TYPING_MS = 1500
const PAUSE_AFTER_ERASING_MS = 220

export function useTypingPlaceholder(phrases) {
  const items = useMemo(() => phrases.filter(Boolean), [phrases])
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [visibleText, setVisibleText] = useState(items[0] ?? '')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!items.length) {
      setVisibleText('')
      return undefined
    }

    const currentPhrase = items[phraseIndex] ?? ''

    if (!isDeleting && visibleText === currentPhrase) {
      const timeoutId = window.setTimeout(() => {
        setIsDeleting(true)
      }, PAUSE_AFTER_TYPING_MS)

      return () => window.clearTimeout(timeoutId)
    }

    if (isDeleting && visibleText === '') {
      const timeoutId = window.setTimeout(() => {
        setIsDeleting(false)
        setPhraseIndex((currentIndex) => (currentIndex + 1) % items.length)
      }, PAUSE_AFTER_ERASING_MS)

      return () => window.clearTimeout(timeoutId)
    }

    const timeoutId = window.setTimeout(() => {
      setVisibleText((currentText) => {
        if (isDeleting) {
          return currentText.slice(0, -1)
        }

        return currentPhrase.slice(0, currentText.length + 1)
      })
    }, isDeleting ? ERASING_DELAY_MS : TYPING_DELAY_MS)

    return () => window.clearTimeout(timeoutId)
  }, [isDeleting, items, phraseIndex, visibleText])

  return visibleText
}
