import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { fetchPublic } from './listings'
import type { ListingView } from './listings'
import { isSupabaseConfigured } from './supabase'

interface Ctx { listings: ListingView[]; loading: boolean; error: string | null; reload: () => void }
const ListingsCtx = createContext<Ctx>({ listings: [], loading: true, error: null, reload: () => {} })
export const useListings = () => useContext(ListingsCtx)

export function ListingsProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<ListingView[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(() => {
    if (!isSupabaseConfigured) { setError('The website is not connected to its database yet.'); setLoading(false); return }
    setLoading(true); setError(null)
    fetchPublic().then(setListings)
      .catch(() => setError('We could not load the listings. Please try again.'))
      .finally(() => setLoading(false))
  }, [])
  useEffect(reload, [reload])

  const value = useMemo(() => ({ listings, loading, error, reload }), [listings, loading, error, reload])
  return <ListingsCtx.Provider value={value}>{children}</ListingsCtx.Provider>
}
