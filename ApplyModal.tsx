import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import Button from './ui/Button'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import type { ListingView } from '../lib/listings'

const field = 'mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm'

export default function ApplyModal({ l, onClose, onApplied }: { l: ListingView; onClose: () => void; onApplied?: () => void }) {
  const { user, profile } = useAuth()
  const [name, setName] = useState(profile?.full_name ?? '')
  const [college, setCollege] = useState(''); const [phone, setPhone] = useState('')
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false); const [done, setDone] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function submit(e: FormEvent) {
    e.preventDefault(); setError('')
    if (!user) return
    if (name.trim().length < 2) return setError('Please enter your full name.')
    if (college.trim().length < 2) return setError('Please enter your college or university.')
    if (!/^[0-9+() -]{7,20}$/.test(phone.trim())) return setError('Please enter a valid phone number.')
    setBusy(true)
    const { error } = await supabase.from('applications').insert({
      user_id: user.id, webinar_id: l.id, full_name: name.trim(), email: user.email, college: college.trim(), phone: phone.trim(),
    })
    setBusy(false)
    if (!error) { setDone(true); onApplied?.() }
    else if (error.code === '23505') setError('You have already applied to this session.')
    else setError(error.message)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={`Apply for ${l.title}`} onClick={e => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        {done ? (
          <div>
            <h2 className="text-lg font-bold text-ink-900">Application received</h2>
            <p role="status" className="mt-3 text-sm">Your application has been submitted successfully. You will be notified by email once your seat is confirmed.</p>
            <Button className="mt-5" onClick={onClose}>Close</Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <h2 className="text-lg font-bold text-ink-900">Apply: {l.title}</h2>
            <label className="block text-sm font-medium text-ink-900">Full name<input className={field} value={name} onChange={e => setName(e.target.value)} autoComplete="name" /></label>
            <label className="block text-sm font-medium text-ink-900">Email address<input className={`${field} bg-slate-50`} value={user?.email ?? ''} readOnly /></label>
            <label className="block text-sm font-medium text-ink-900">College / University<input className={field} value={college} onChange={e => setCollege(e.target.value)} /></label>
            <label className="block text-sm font-medium text-ink-900">Phone number<input type="tel" className={field} value={phone} onChange={e => setPhone(e.target.value)} autoComplete="tel" /></label>
            {l.isPaid && <p className="text-xs text-slate-500">This is a paid session. Applying takes no payment; payment details are shared separately.</p>}
            {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
            <div className="flex gap-3">
              <Button type="submit" disabled={busy}>{busy ? 'Submitting…' : 'Submit application'}</Button>
              <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
