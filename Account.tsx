import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import EmptyState from '../components/EmptyState'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import { TYPE_META } from '../lib/listings'
import type { Kind } from '../lib/listings'
import { formatDateTime } from '../lib/format'

interface AppRow { id: string; status: string; created_at: string; webinars: { id: string; kind: Kind; title: string; start_at: string; time_zone: string } | null }

export default function Account() {
  const { user, profile, signOut, refreshProfile, isAdmin } = useAuth()
  const [name, setName] = useState(profile?.full_name ?? '')
  const [msg, setMsg] = useState('')
  const [apps, setApps] = useState<AppRow[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => { setName(profile?.full_name ?? '') }, [profile])
  const load = useCallback(async () => {
    const { data, error } = await supabase.from('applications')
      .select('id,status,created_at,webinars(id,kind,title,start_at,time_zone)').order('created_at', { ascending: false })
    if (error) setError('Could not load your applications.'); else setApps(data as unknown as AppRow[])
  }, [])
  useEffect(() => { load() }, [load])

  async function saveName() {
    if (!user || name.trim().length < 2) return setMsg('Please enter your full name.')
    const { error } = await supabase.from('profiles').update({ full_name: name.trim() }).eq('id', user.id)
    setMsg(error ? 'Could not save your name.' : 'Saved.'); if (!error) refreshProfile()
  }
  async function withdraw(id: string) {
    if (!window.confirm('Withdraw this application?')) return
    const { error } = await supabase.from('applications').delete().eq('id', id)
    if (error) setError('Could not withdraw. Please try again.'); else load()
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-ink-900">My account</h1>
      <p className="mt-1 text-sm"><span className="font-semibold text-ink-900">{profile?.full_name || 'Student'}</span> · {user?.email}</p>
      <div className="mt-6 flex flex-wrap items-end gap-3">
        <label className="text-sm font-medium text-ink-900">Full name
          <input value={name} onChange={e => setName(e.target.value)} className="mt-1 block rounded-xl border border-slate-300 px-3 py-2.5 text-sm" /></label>
        <Button onClick={saveName}>Save</Button>
        <Button variant="secondary" onClick={() => signOut()}>Log out</Button>
        {isAdmin && <Button to="/admin" variant="ghost">Admin dashboard</Button>}
      </div>
      {msg && <p role="status" className="mt-2 text-sm text-brand-700">{msg}</p>}

      <h2 className="mt-12 text-xl font-bold text-ink-900">My applications</h2>
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
      {apps === null ? <p className="mt-4 text-slate-500">Loading…</p> : apps.length === 0 ? (
        <div className="mt-4"><EmptyState title="No applications yet" text="Find a session you like and press Apply Now." action={<Button to="/webinars">Browse webinars</Button>} /></div>
      ) : (
        <ul className="mt-4 divide-y divide-slate-200 rounded-2xl bg-white ring-1 ring-slate-200">
          {apps.map(a => a.webinars && (
            <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <Link to={`${TYPE_META[a.webinars.kind].path}/${a.webinars.id}`} className="font-semibold text-ink-900 hover:text-brand-700">{a.webinars.title}</Link>
                <p className="text-xs text-slate-500">{formatDateTime(new Date(a.webinars.start_at), a.webinars.time_zone)} · Applied {new Date(a.created_at).toLocaleDateString('en-IN')}</p>
              </div>
              <div className="flex items-center gap-2"><Badge tone={a.status === 'approved' ? 'green' : a.status === 'rejected' ? 'slate' : 'amber'}>{a.status === 'approved' ? 'Seat confirmed' : a.status === 'rejected' ? 'Not accepted' : 'Pending review'}</Badge>
                <Button variant="secondary" className="!py-2" onClick={() => withdraw(a.id)}>Withdraw</Button></div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
