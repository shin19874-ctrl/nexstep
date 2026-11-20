import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { fetchApps } from '../../lib/apps'
import { TYPES, fmt } from '../../lib/config'
import { Empty, Modal, Spinner, StatusBadge } from '../../components/ui'

export default function UsersPage() {
  const [users, setUsers] = useState(null)
  const [q, setQ] = useState('')
  const [sel, setSel] = useState(null)
  const [apps, setApps] = useState(null)
  useEffect(() => { supabase.from('profiles').select('*').order('created_at', { ascending: false }).then(({ data }) => setUsers(data || [])) }, [])
  const pick = (u) => { setSel(u); setApps(null); fetchApps(u.id).then(setApps) }

  if (!users) return <Spinner />
  const list = users.filter((u) => `${u.full_name} ${u.email}`.toLowerCase().includes(q.toLowerCase()))
  return (
    <div>
      <input className="input mb-4 sm:max-w-sm" placeholder="Search users…" value={q} onChange={(e) => setQ(e.target.value)} />
      {list.length === 0 ? <Empty title="No users found" /> : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Joined</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((u) => (
                <tr key={u.id} className="cursor-pointer hover:bg-ocean-50/50" onClick={() => pick(u)}>
                  <td className="px-4 py-3 font-medium text-navy-900">{u.full_name || '—'}</td><td className="px-4 py-3">{u.email}</td><td className="px-4 py-3">{u.phone || '—'}</td><td className="px-4 py-3 text-slate-500">{fmt(u.created_at, 'date')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {sel && (
        <Modal title={sel.full_name || sel.email} onClose={() => setSel(null)}>
          <p className="text-sm text-slate-600">{sel.email} · {sel.phone || 'no phone'} · joined {fmt(sel.created_at, 'date')}</p>
          <h3 className="mb-2 mt-5 font-semibold">Application history</h3>
          {!apps ? <Spinner /> : apps.length === 0 ? <p className="text-sm text-slate-500">No applications yet.</p> : (
            <ul className="divide-y divide-slate-100">
              {apps.map((a) => <li key={a.type + a.id} className="flex items-center justify-between gap-3 py-2.5 text-sm"><div><p className="font-medium text-navy-900">{a.itemTitle}</p><p className="text-xs text-slate-500">{TYPES[a.type].label} · {fmt(a.created_at)}</p></div><StatusBadge status={a.status} /></li>)}
            </ul>
          )}
        </Modal>
      )}
    </div>
  )
}
