import { useState } from 'react'
import type { FormEvent } from 'react'
import Dashboard from '../components/admin/Dashboard'
import Button from '../components/ui/Button'
import { useAuth } from '../lib/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'

const field = 'mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm'
const Box = ({ children }: { children: React.ReactNode }) => <div className="mx-auto max-w-md px-4 py-20">{children}</div>

// The database (RLS) decides what an admin may do. This page only chooses what to display.
export default function Admin() {
  const { user, loading, isAdmin, signIn, signOut } = useAuth()
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('')
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false)

  if (!isSupabaseConfigured) return <Box><p className="text-center">The website is not connected to its database yet.</p></Box>
  if (loading) return <Box><p className="text-center text-slate-500">Loading…</p></Box>

  if (!user) {
    const submit = async (e: FormEvent) => {
      e.preventDefault(); setError(''); setBusy(true)
      try { await signIn(email.trim(), password) }
      catch { setError('Incorrect email or password, or your email is not verified yet.') }
      setBusy(false)
    }
    return (
      <Box>
        <h1 className="text-2xl font-bold text-ink-900">Admin login</h1>
        <p className="mt-1 text-sm">For the NEXSTEP administrator only.</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-ink-900">Email<input type="email" required className={field} value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" /></label>
          <label className="block text-sm font-medium text-ink-900">Password<input type="password" required className={field} value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" /></label>
          {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
          <Button type="submit" disabled={busy} className="w-full">{busy ? 'Please wait…' : 'Log in'}</Button>
        </form>
      </Box>
    )
  }
  if (!isAdmin) return (
    <Box>
      <h1 className="text-center text-2xl font-bold text-ink-900">Not authorised</h1>
      <p className="mt-2 text-center">{user.email} does not have admin access.</p>
      <div className="mt-6 text-center"><Button variant="secondary" onClick={() => signOut()}>Log out</Button></div>
    </Box>
  )
  return <Dashboard />
}
