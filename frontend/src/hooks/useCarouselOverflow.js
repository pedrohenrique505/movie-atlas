import { useEffect, useState } from 'react'

export function useCarouselOverflow(trackRef, dependencies = []) {
  const [hasOverflow, setHasOverflow] = useState(false)

  useEffect(() => {
    const node = trackRef.current

    if (!node) {
      return undefined
    }

    function updateOverflow() {
      setHasOverflow(node.scrollWidth > node.clientWidth + 8)
    }

    updateOverflow()

    const observer =
      typeof ResizeObserver === 'function' ? new ResizeObserver(updateOverflow) : null

    observer?.observe(node)
    Array.from(node.children).forEach((child) => observer?.observe(child))
    window.addEventListener('resize', updateOverflow)

    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', updateOverflow)
    }
  }, [trackRef, ...dependencies])

  return hasOverflow
}
