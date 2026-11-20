import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { fetchApps } from '../../lib/apps'
import { TYPES, fmt } from '../../lib/config'
import { Spinner, StatusBadge } from '../../components/ui'

const count = (t) => supabase.from(t).select('*', { count: 'exact', head: true }).then((r) => r.count ?? 0)

export default function Overview() {
  const [s, setS] = useState(null)
  useEffect(() => {
    Promise.all([count('profiles'), count('webinars'), count('courses'), count('internships'), fetchApps()])
      .then(([users, w, c, i, apps]) => setS({ users, w, c, i, apps }))
  }, [])
  if (!s) return <Spinner />
  const cards = [['Registered users', s.users], ['Webinars', s.w], ['Courses', s.c], ['Internships', s.i], ['Applications', s.apps.length]]
  return (
    <div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {cards.map(([l, n]) => <div key={l} className="card p-5"><p className="text-3xl font-bold text-navy-900">{n}</p><p className="mt-1 text-sm text-slate-500">{l}</p></div>)}
      </div>
      <h2 className="mb-3 mt-10 text-lg font-semibold">Recent applications</h2>
      {s.apps.length === 0 ? <p className="text-sm text-slate-500">No applications yet.</p> : (
        <div className="card divide-y divide-slate-100">
          {s.apps.slice(0, 8).map((a) => (
            <div key={a.type + a.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
              <div><p className="font-medium text-navy-900">{a.full_name} <span className="font-normal text-slate-500">· {a.email}</span></p><p className="text-slate-500">{TYPES[a.type].label}: {a.itemTitle} · {fmt(a.created_at)}</p></div>
              <StatusBadge status={a.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
