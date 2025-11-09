import { useState, useEffect, useCallback } from 'react'
import { apiGet } from '@/lib/fetcher'

interface UseApiOptions {
  initialData?: any
  dependencies?: any[]
  enabled?: boolean
}

export function useApi<T = any>(
  url: string | null, 
  options: UseApiOptions = {}
) {
  const { initialData = null, dependencies = [], enabled = true } = options
  const [data, setData] = useState<T | null>(initialData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!url || !enabled) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const result = await apiGet(url)
      setData(result as T)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('API Error:', err)
    } finally {
      setLoading(false)
    }
  }, [url, enabled])

  useEffect(() => {
    let isCancelled = false

    const loadData = async () => {
      if (!url || !enabled) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const result = await apiGet(url)
        if (!isCancelled) {
          setData(result as T)
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'An error occurred')
          console.error('API Error:', err)
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isCancelled = true
    }
  }, [url, enabled, ...dependencies])

  const refetch = useCallback(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch }
}

export default useApi