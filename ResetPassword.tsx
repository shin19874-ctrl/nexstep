import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button'
import { useAuth } from '../lib/AuthContext'

export default function ResetPassword() {
  const { user, loading, updatePassword, clearRecovery } = useAuth()
  const nav = useNavigate()
  const [pw, setPw] = useState(''); const [pw2, setPw2] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  if (loading) return <p className="px-4 py-20 text-center text-slate-500">Loading…</p>
  if (!user) return <Navigate to="/forgot-password" replace />
  async function submit(e: FormEvent) {
    e.preventDefault(); setErr('')
    if (pw.length < 8) return setErr('Password must be at least 8 characters.')
    if (pw !== pw2) return setErr('The two passwords do not match.')
    setBusy(true)
    try { await updatePassword(pw); clearRecovery(); nav('/account', { replace: true }) }
    catch (x) { setErr((x as Error).message); setBusy(false) }
  }
  const f = 'mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm'
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-extrabold text-ink-900">Choose a new password</h1>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-ink-900">New password<input type="password" className={f} value={pw} onChange={e => setPw(e.target.value)} autoComplete="new-password" /></label>
        <label className="block text-sm font-medium text-ink-900">Confirm password<input type="password" className={f} value={pw2} onChange={e => setPw2(e.target.value)} autoComplete="new-password" /></label>
        {err && <p role="alert" className="text-sm font-medium text-red-600">{err}</p>}
        <Button type="submit" disabled={busy} className="w-full">{busy ? 'Saving…' : 'Save password'}</Button>
      </form>
    </div>
  )
}
