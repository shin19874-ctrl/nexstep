import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import ListingCard from '../components/ListingCard'
import EmptyState from '../components/EmptyState'
import Button from '../components/ui/Button'
import { useListings } from '../lib/ListingsContext'
import { TYPE_META } from '../lib/listings'
import { CATEGORIES } from '../data/categories'
import type { Kind } from '../lib/listings'

const field = 'rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm'

export default function Listings({ type }: { type: Kind }) {
  const meta = TYPE_META[type]
  const [params] = useSearchParams()
  const { listings, loading, error, reload } = useListings()
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming')
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState(params.get('category') ?? '')
  const [price, setPrice] = useState('')

  const ofType = listings.filter(l => l.type === type)
  const results = ofType.filter(l => {
    const q = query.trim().toLowerCase()
    return (tab === 'upcoming' ? l.upcoming : !l.upcoming) &&
      (!q || [l.title, l.instructor, l.category, l.description].some(t => t.toLowerCase().includes(q))) &&
      (!category || l.category === category) &&
      (!price || (price === 'free' ? l.price === 0 : l.price > 0))
  })

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-ink-900">{meta.plural}</h1>
      <p className="mt-1">Browse upcoming {meta.plural.toLowerCase()} or revisit past ones with their dates and recordings.</p>
      {loading ? (
        <p className="mt-10 text-slate-500">Loading…</p>
      ) : error ? (
        <div className="mt-8"><EmptyState title="Something went wrong" text={error} action={<Button variant="secondary" onClick={reload}>Try again</Button>} /></div>
      ) : ofType.length === 0 ? (
        <div className="mt-8"><EmptyState title={`No ${meta.plural.toLowerCase()} yet`} text="New sessions will appear here as soon as they are added." /></div>
      ) : (
        <>
          <div className="mt-6 inline-flex rounded-xl bg-slate-100 p-1">
            {(['upcoming', 'past'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} aria-pressed={tab === t}
                className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize ${tab === t ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600'}`}>{t}</button>
            ))}
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <label className="relative md:col-span-2">
              <span className="sr-only">Search</span>
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search title, instructor or topic" className={`${field} w-full pl-9`} />
            </label>
            <select aria-label="Category" className={field} value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">All categories</option>{CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
            <select aria-label="Price" className={field} value={price} onChange={e => setPrice(e.target.value)}>
              <option value="">Free and paid</option><option value="free">Free</option><option value="paid">Paid</option>
            </select>
          </div>
          <div className="mt-8">
            {results.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{results.map(l => <ListingCard key={l.id} l={l} />)}</div>
            ) : (
              <EmptyState title={`No ${tab} ${meta.plural.toLowerCase()} found`} text="Try a different search or clear the filters."
                action={<Button variant="secondary" onClick={() => { setQuery(''); setCategory(''); setPrice('') }}>Clear filters</Button>} />
            )}
          </div>
        </>
      )}
    </div>
  )
}
