import { useEffect, useMemo, useState } from 'react'

const TYPING_DELAY_MS = 80
const ERASING_DELAY_MS = 42
const PAUSE_AFTER_TYPING_MS = 1500
const PAUSE_AFTER_ERASING_MS = 260

export function useTypingPlaceholder(prefix, examples) {
  const items = useMemo(() => examples.filter(Boolean), [examples])
  const [exampleIndex, setExampleIndex] = useState(0)
  const [visibleSuffix, setVisibleSuffix] = useState(items[0] ?? '')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!items.length) {
      setVisibleSuffix('')
      return undefined
    }

    const currentExample = items[exampleIndex] ?? ''

    if (!isDeleting && visibleSuffix === currentExample) {
      const timeoutId = window.setTimeout(() => {
        setIsDeleting(true)
      }, PAUSE_AFTER_TYPING_MS)

      return () => window.clearTimeout(timeoutId)
    }

    if (isDeleting && visibleSuffix === '') {
      const timeoutId = window.setTimeout(() => {
        setIsDeleting(false)
        setExampleIndex((currentIndex) => (currentIndex + 1) % items.length)
      }, PAUSE_AFTER_ERASING_MS)

      return () => window.clearTimeout(timeoutId)
    }

    const timeoutId = window.setTimeout(() => {
      setVisibleSuffix((currentText) => {
        if (isDeleting) {
          return currentText.slice(0, -1)
        }

        return currentExample.slice(0, currentText.length + 1)
      })
    }, isDeleting ? ERASING_DELAY_MS : TYPING_DELAY_MS)

    return () => window.clearTimeout(timeoutId)
  }, [exampleIndex, isDeleting, items, visibleSuffix])

  return `${prefix}${visibleSuffix}`
}
