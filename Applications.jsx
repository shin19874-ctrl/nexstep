import { useEffect, useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { supabase, sendEmail } from '../../lib/supabase'
import { fetchApps } from '../../lib/apps'
import { STATUS, TYPES, fmt } from '../../lib/config'
import { Empty, Modal, Spinner, StatusBadge, useToast } from '../../components/ui'

const csvCell = (v) => { let s = String(v ?? ''); if (/^[=+\-@]/.test(s)) s = "'" + s; return `"${s.replace(/"/g, '""')}"` }

export default function Applications() {
  const toast = useToast()
  const [apps, setApps] = useState(null)
  const [type, setType] = useState('all'); const [status, setStatus] = useState('all'); const [item, setItem] = useState('all'); const [q, setQ] = useState('')
  const [open, setOpen] = useState(null)
  useEffect(() => { fetchApps().then(setApps) }, [])

  const items = useMemo(() => [...new Set((apps || []).filter((a) => type === 'all' || a.type === type).map((a) => a.itemTitle))], [apps, type])
  const list = (apps || []).filter((a) =>
    (type === 'all' || a.type === type) && (status === 'all' || a.status === status) && (item === 'all' || a.itemTitle === item) &&
    `${a.full_name} ${a.email}`.toLowerCase().includes(q.toLowerCase()))

  const setSt = async (a, st) => {
    const { error } = await supabase.from(TYPES[a.type].appTable).update({ status: st }).eq('id', a.id)
    if (error) return toast('Could not update status.', 'err')
    setApps((p) => p.map((x) => (x.id === a.id && x.type === a.type ? { ...x, status: st } : x)))
    setOpen((o) => (o ? { ...o, status: st } : o))
    if (st === 'pending') return toast('Status updated')
    const ok = await sendEmail('status', TYPES[a.type].appTable, a.id)
    toast(ok ? 'Status updated and email sent' : 'Status updated. Email was not sent (email service not set up yet).', ok ? 'ok' : 'err')
  }

  const exportCsv = () => {
    const head = ['Type', 'Opportunity', 'Name', 'Email', 'Phone', 'College', 'Degree', 'Year', 'Reason', 'Status', 'Applied at']
    const rows = list.map((a) => [TYPES[a.type].label, a.itemTitle, a.full_name, a.email, a.phone, a.college, a.degree, a.year_of_study, a.reason, STATUS[a.status].label, a.created_at])
    const blob = new Blob(['\ufeff' + [head, ...rows].map((r) => r.map(csvCell).join(',')).join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob); const el = document.createElement('a')
    el.href = url; el.download = `nexstep-applications-${new Date().toISOString().slice(0, 10)}.csv`; el.click(); URL.revokeObjectURL(url)
  }

  if (!apps) return <Spinner />
  return (
    <div>
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <input className="input lg:col-span-2" placeholder="Search by name or email…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input" value={type} onChange={(e) => { setType(e.target.value); setItem('all') }}><option value="all">All types</option>{Object.entries(TYPES).map(([k, c]) => <option key={k} value={k}>{c.plural}</option>)}</select>
        <select className="input" value={item} onChange={(e) => setItem(e.target.value)}><option value="all">All listings</option>{items.map((t) => <option key={t}>{t}</option>)}</select>
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">All statuses</option>{Object.entries(STATUS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}</select>
      </div>
      <div className="mb-3 flex items-center justify-between"><p className="text-sm text-slate-500">{list.length} application{list.length === 1 ? '' : 's'}</p><button className="btn-outline btn-sm" onClick={exportCsv} disabled={!list.length}><Download className="h-3.5 w-3.5" />Export CSV</button></div>
      {list.length === 0 ? <Empty title="No applications found" text="Try changing your filters." /> : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500"><tr><th className="px-4 py-3">Applicant</th><th className="px-4 py-3">Applied for</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((a) => (
                <tr key={a.type + a.id} className="cursor-pointer hover:bg-ocean-50/50" onClick={() => setOpen(a)}>
                  <td className="px-4 py-3"><p className="font-medium text-navy-900">{a.full_name}</p><p className="text-xs text-slate-500">{a.email}</p></td>
                  <td className="px-4 py-3"><p>{a.itemTitle}</p><p className="text-xs text-slate-500">{TYPES[a.type].label}</p></td>
                  <td className="px-4 py-3 text-slate-500">{fmt(a.created_at)}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {open && (
        <Modal title="Application details" onClose={() => setOpen(null)}>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {[['Applied for', `${TYPES[open.type].label}: ${open.itemTitle}`], ['Applied on', fmt(open.created_at)], ['Name', open.full_name], ['Email', open.email], ['Phone', open.phone], ['College / University', open.college], ['Degree', open.degree], ['Year of study', open.year_of_study]].map(([k, v]) => (
              <div key={k}><dt className="text-slate-500">{k}</dt><dd className="font-medium text-navy-900">{v}</dd></div>
            ))}
            <div className="sm:col-span-2"><dt className="text-slate-500">Reason</dt><dd className="whitespace-pre-line">{open.reason}</dd></div>
          </dl>
          <div className="mt-6 border-t border-slate-100 pt-4">
            <p className="label">Change status <span className="font-normal text-slate-500">(the applicant is emailed for Under review, Accepted or Rejected)</span></p>
            <div className="flex flex-wrap gap-2">{Object.entries(STATUS).map(([k, s]) => <button key={k} disabled={open.status === k} onClick={() => setSt(open, k)} className={open.status === k ? 'btn-primary btn-sm' : 'btn-outline btn-sm'}>{s.label}</button>)}</div>
          </div>
        </Modal>
      )}
    </div>
  )
}
