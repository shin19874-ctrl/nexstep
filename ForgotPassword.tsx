import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import { useAuth } from '../lib/AuthContext'
import { friendly } from './AuthPage'

export default function ForgotPassword() {
  const { sendReset } = useAuth()
  const [email, setEmail] = useState(''); const [msg, setMsg] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false)
  async function submit(e: FormEvent) {
    e.preventDefault(); setBusy(true); setErr(''); setMsg('')
    try { await sendReset(email.trim()); setMsg('If an account exists for this email, a reset link is on its way. Check your inbox.') }
    catch (x) { setErr(friendly((x as Error).message)) }
    setBusy(false)
  }
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-extrabold text-ink-900">Reset your password</h1>
      <p className="mt-2 text-sm">Works for accounts created with email and password. Google users sign in with Google.</p>
      <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-sm font-medium text-ink-900">Email
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></label>
        {err && <p role="alert" className="text-sm font-medium text-red-600">{err}</p>}
        {msg && <p role="status" className="rounded-xl bg-brand-50 p-3 text-sm font-medium text-brand-700">{msg}</p>}
        <Button type="submit" disabled={busy} className="w-full">{busy ? 'Sending…' : 'Send reset link'}</Button>
      </form>
      <p className="mt-4 text-sm"><Link to="/login" className="font-semibold text-brand-700 hover:underline">Back to login</Link></p>
    </div>
  )
}
