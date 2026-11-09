import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../components/ui/Button'
import { useAuth } from '../lib/AuthContext'
import { isSupabaseConfigured } from '../lib/supabase'

const field = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm'
export const safeNext = (n: string | null) => (n && n.startsWith('/') && !n.startsWith('//') ? n : '/account')

export function friendly(msg: string) {
  if (/invalid login/i.test(msg)) return 'Incorrect email or password.'
  if (/not confirmed/i.test(msg)) return 'Please verify your email first. Check your inbox for the link.'
  if (/already registered/i.test(msg)) return 'An account with this email already exists. Try logging in.'
  if (/rate limit/i.test(msg)) return 'Too many attempts. Please wait a few minutes and try again.'
  if (/provider is not enabled/i.test(msg)) return 'Google sign-in is not switched on yet. Please use email and password.'
  return msg
}

export default function AuthPage({ mode }: { mode: 'login' | 'signup' }) {
  const { user, signIn, signUp, signInWithGoogle } = useAuth()
  const nav = useNavigate()
  const [params] = useSearchParams()
  const next = safeNext(params.get('next'))
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState('')
  const [error, setError] = useState(''); const [info, setInfo] = useState(''); const [busy, setBusy] = useState(false)
  useEffect(() => { setError(''); setInfo('') }, [mode])

  if (user) return <Navigate to={next} replace />
  if (!isSupabaseConfigured) return <p className="px-4 py-20 text-center">The website is not connected to its database yet.</p>

  async function submit(e: FormEvent) {
    e.preventDefault(); setError(''); setInfo('')
    if (mode === 'signup' && name.trim().length < 2) return setError('Please enter your full name.')
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    setBusy(true)
    try {
      if (mode === 'login') { await signIn(email.trim(), password); nav(next, { replace: true }) }
      else {
        const { needsVerification } = await signUp(email.trim(), password, name.trim())
        if (needsVerification) setInfo('Account created. We sent a verification link to your email. Open it, then log in here.')
        else nav(next, { replace: true })
      }
    } catch (err) { setError(friendly((err as Error).message)) }
    setBusy(false)
  }
  const google = () => signInWithGoogle(next).catch(err => setError(friendly((err as Error).message)))

  const q = params.get('next') ? `?next=${encodeURIComponent(next)}` : ''
  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-16">
      <h1 className="text-3xl font-extrabold text-ink-900">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
      <Button variant="secondary" className="mt-6 w-full" onClick={google}>Continue with Google</Button>
      <p className="my-4 text-center text-xs uppercase tracking-wide text-slate-400">or use email</p>
      <form onSubmit={submit} className="space-y-4">
        {mode === 'signup' && <label className="block text-sm font-medium text-ink-900">Full name<input className={`${field} mt-1`} value={name} onChange={e => setName(e.target.value)} autoComplete="name" /></label>}
        <label className="block text-sm font-medium text-ink-900">Email<input type="email" required className={`${field} mt-1`} value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" /></label>
        <label className="block text-sm font-medium text-ink-900">Password<input type="password" required className={`${field} mt-1`} value={password} onChange={e => setPassword(e.target.value)} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
        {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
        {info && <p role="status" className="rounded-xl bg-brand-50 p-3 text-sm font-medium text-brand-700">{info}</p>}
        <Button type="submit" disabled={busy} className="w-full">{busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}</Button>
      </form>
      {mode === 'login' && <p className="mt-4 text-sm"><Link to="/forgot-password" className="font-semibold text-brand-700 hover:underline">Forgot password?</Link></p>}
      <p className="mt-4 text-sm">{mode === 'login' ? 'New to NEXSTEP? ' : 'Already have an account? '}
        <Link to={`${mode === 'login' ? '/signup' : '/login'}${q}`} className="font-semibold text-brand-700 hover:underline">{mode === 'login' ? 'Sign up' : 'Log in'}</Link></p>
    </div>
  )
}
