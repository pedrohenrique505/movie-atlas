import { useEffect, useRef, useState } from 'react'

function mergeUniqueItems(previousItems, nextItems) {
  const seenIds = new Set(previousItems.map((item) => item.id))
  const mergedItems = [...previousItems]

  for (const item of nextItems) {
    if (seenIds.has(item.id)) {
      continue
    }
    seenIds.add(item.id)
    mergedItems.push(item)
  }

  return mergedItems
}

export function usePaginatedCollection(fetchPage, fallbackErrorMessage, resetKey = 'default') {
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const requestIdRef = useRef(0)
  const fetchPageRef = useRef(fetchPage)

  fetchPageRef.current = fetchPage

  useEffect(() => {
    let isMounted = true
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId

    async function loadFirstPage() {
      try {
        setIsLoading(true)
        setErrorMessage('')

        const payload = await fetchPageRef.current({ page: 1, paginated: true })

        if (!isMounted || requestId !== requestIdRef.current) {
          return
        }

        setItems(payload.results ?? [])
        setPage(payload.pagination?.page ?? 1)
        setHasNextPage(Boolean(payload.pagination?.has_next))
      } catch (error) {
        if (!isMounted || requestId !== requestIdRef.current) {
          return
        }

        setItems([])
        setHasNextPage(false)
        setErrorMessage(error instanceof Error ? error.message : fallbackErrorMessage)
      } finally {
        if (isMounted && requestId === requestIdRef.current) {
          setIsLoading(false)
        }
      }
    }

    loadFirstPage()

    return () => {
      isMounted = false
    }
  }, [fallbackErrorMessage, resetKey])

  async function loadMore() {
    if (isLoading || isLoadingMore || !hasNextPage) {
      return
    }

    const nextPage = page + 1

    try {
      setIsLoadingMore(true)
      setErrorMessage('')

      const payload = await fetchPageRef.current({ page: nextPage, paginated: true })

      setItems((currentItems) => mergeUniqueItems(currentItems, payload.results ?? []))
      setPage(payload.pagination?.page ?? nextPage)
      setHasNextPage(Boolean(payload.pagination?.has_next))
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : fallbackErrorMessage)
    } finally {
      setIsLoadingMore(false)
    }
  }

  return {
    items,
    isLoading,
    isLoadingMore,
    errorMessage,
    hasNextPage,
    loadMore,
  }
}
