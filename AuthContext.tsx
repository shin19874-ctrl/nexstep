import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from './supabase'

export interface Profile { id: string; full_name: string; email: string | null; role: 'student' | 'admin' }
interface Ctx {
  user: User | null; profile: Profile | null; loading: boolean; isAdmin: boolean; recovery: boolean
  signUp: (email: string, password: string, name: string) => Promise<{ needsVerification: boolean }>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: (next: string) => Promise<void>
  sendReset: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
  clearRecovery: () => void
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}
const none = async () => { throw new Error('Not ready') }
const AuthCtx = createContext<Ctx>({
  user: null, profile: null, loading: false, isAdmin: false, recovery: false,
  signUp: none as never, signIn: none, signInWithGoogle: none, sendReset: none, updatePassword: none,
  clearRecovery: () => {}, signOut: none, refreshProfile: none,
})
export const useAuth = () => useContext(AuthCtx)

const here = () => window.location.origin + window.location.pathname

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [recovery, setRecovery] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user ?? null); if (!data.session) setLoading(false) })
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (event === 'PASSWORD_RECOVERY') setRecovery(true)
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  const loadProfile = useCallback(async (id: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle()
    setProfile((data as Profile) ?? null)
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) return
    if (!user) { setProfile(null); return }
    loadProfile(user.id).finally(() => setLoading(false))
  }, [user, loadProfile])

  const value = useMemo<Ctx>(() => ({
    user, profile, loading, recovery,
    isAdmin: profile?.role === 'admin', // display only: the database enforces the real permission
    signUp: async (email, password, name) => {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name }, emailRedirectTo: here() } })
      if (error) throw error
      return { needsVerification: !data.session }
    },
    signIn: async (email, password) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    },
    signInWithGoogle: async next => {
      sessionStorage.setItem('nexstep_next', next)
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: here() } })
      if (error) throw error
    },
    sendReset: async email => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: here() })
      if (error) throw error
    },
    updatePassword: async password => {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
    },
    clearRecovery: () => setRecovery(false),
    signOut: async () => { await supabase.auth.signOut() },
    refreshProfile: async () => { if (user) await loadProfile(user.id) },
  }), [user, profile, loading, recovery, loadProfile])
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}
