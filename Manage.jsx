import { useCallback, useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { TYPES, fmt, toLocalInput } from '../../lib/config'
import { Empty, ErrorBox, Modal, Spinner, useToast } from '../../components/ui'
import { Poster } from '../../components/Card'

const blank = (cfg) => Object.fromEntries([...cfg.fields.map((f) => [f.n, f.t === 'select' ? f.o[0] : '']), ['poster_url', ''], ['published', false]])

function Form({ type, item, onClose, onSaved }) {
  const cfg = TYPES[type]
  const toast = useToast()
  const [f, setF] = useState(() => {
    if (!item) return blank(cfg)
    const o = { ...blank(cfg), ...Object.fromEntries(Object.entries(item).map(([k, v]) => [k, v ?? ''])) }
    cfg.fields.filter((x) => x.t === 'datetime').forEach((x) => (o[x.n] = toLocalInput(item[x.n])))
    return o
  })
  const [file, setFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }))

  const save = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true)
    try {
      let poster_url = f.poster_url || null
      if (file) {
        if (file.size > 5 * 1024 * 1024) throw new Error('Poster must be under 5 MB.')
        const path = `${type}/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, '_')}`
        const up = await supabase.storage.from('posters').upload(path, file, { contentType: file.type })
        if (up.error) throw up.error
        poster_url = supabase.storage.from('posters').getPublicUrl(path).data.publicUrl
      }
      const row = { poster_url, published: f.published }
      cfg.fields.forEach((x) => {
        const v = f[x.n]
        row[x.n] = v === '' ? null : x.t === 'datetime' ? new Date(v).toISOString() : v
      })
      if (type === 'internships' && row.apply_type !== 'external') row.apply_link = null
      const { error } = item ? await supabase.from(cfg.table).update(row).eq('id', item.id) : await supabase.from(cfg.table).insert(row)
      if (error) throw error
      toast(item ? 'Changes saved' : `${cfg.label} created`); onSaved()
    } catch (x) { setErr(x.message || 'Could not save.') } finally { setBusy(false) }
  }

  return (
    <Modal wide title={`${item ? 'Edit' : 'New'} ${cfg.label.toLowerCase()}`} onClose={onClose}>
      <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
        {cfg.fields.filter((x) => !x.showIf || x.showIf(f)).map((x) => (
          <div key={x.n} className={x.full ? 'sm:col-span-2' : ''}>
            <label className="label">{x.l}</label>
            {x.t === 'textarea' ? <textarea rows={4} className="input" value={f[x.n]} onChange={(e) => set(x.n, e.target.value)} />
              : x.t === 'select' ? <select className="input" value={f[x.n]} onChange={(e) => set(x.n, e.target.value)}>{x.o.map((o) => <option key={o} value={o}>{x.labels?.[o] || o}</option>)}</select>
              : <input required={x.req} type={x.t === 'datetime' ? 'datetime-local' : x.t === 'date' ? 'date' : 'text'} placeholder={x.ph} className="input" value={f[x.n]} onChange={(e) => set(x.n, e.target.value)} />}
          </div>
        ))}
        <div className="sm:col-span-2">
          <label className="label">Poster / banner (JPG, PNG or WebP, max 5 MB)</label>
          {f.poster_url && !file && <img src={f.poster_url} alt="" className="mb-2 h-28 rounded-lg object-cover" />}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="input" onChange={(e) => setFile(e.target.files[0] || null)} />
        </div>
        <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2"><input type="checkbox" checked={f.published} onChange={(e) => set('published', e.target.checked)} className="h-4 w-4" /> Published (visible to everyone)</label>
        <div className="sm:col-span-2"><ErrorBox>{err}</ErrorBox></div>
        <div className="flex justify-end gap-2 sm:col-span-2"><button type="button" className="btn-outline" onClick={onClose}>Cancel</button><button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button></div>
      </form>
    </Modal>
  )
}

export default function Manage({ type }) {
  const cfg = TYPES[type]
  const toast = useToast()
  const [rows, setRows] = useState(null)
  const [edit, setEdit] = useState(null) // null | 'new' | row
  const load = useCallback(() => supabase.from(cfg.table).select('*').order('created_at', { ascending: false }).then(({ data }) => setRows(data || [])), [type])
  useEffect(() => { setRows(null); load() }, [type])
  const dateField = cfg.fields.find((f) => f.card && f.t.startsWith('date'))

  const toggle = async (r) => {
    const { error } = await supabase.from(cfg.table).update({ published: !r.published }).eq('id', r.id)
    if (error) toast('Could not update.', 'err'); else { toast(r.published ? 'Unpublished' : 'Published'); load() }
  }
  const del = async (r) => {
    if (!confirm(`Delete "${r.title}"? All applications for it will also be deleted. This cannot be undone.`)) return
    const { error } = await supabase.from(cfg.table).delete().eq('id', r.id)
    if (error) toast('Could not delete.', 'err'); else { toast('Deleted'); load() }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{cfg.plural}</h2>
        <button className="btn-primary" onClick={() => setEdit('new')}><Plus className="h-4 w-4" />Add {cfg.label.toLowerCase()}</button>
      </div>
      {!rows ? <Spinner /> : rows.length === 0 ? <Empty title={`No ${cfg.plural.toLowerCase()} yet`} text={`Click "Add ${cfg.label.toLowerCase()}" to create your first one.`} /> : (
        <div className="card divide-y divide-slate-100">
          {rows.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-4 p-4">
              <Poster type={type} url={r.poster_url} className="h-14 w-24 rounded-md" />
              <div className="min-w-0 flex-1"><p className="truncate font-semibold text-navy-900">{r.title}</p><p className="text-xs text-slate-500">{dateField ? fmt(r[dateField.n], dateField.t) : fmt(r.created_at)}</p></div>
              <button onClick={() => toggle(r)} className={`rounded-full px-3 py-1 text-xs font-medium ${r.published ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{r.published ? 'Published' : 'Draft'}</button>
              <button className="btn-outline btn-sm" onClick={() => setEdit(r)}><Pencil className="h-3.5 w-3.5" />Edit</button>
              <button className="btn btn-sm text-red-600 hover:bg-red-50" onClick={() => del(r)} aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}
      {edit && <Form type={type} item={edit === 'new' ? null : edit} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); load() }} />}
    </div>
  )
}
