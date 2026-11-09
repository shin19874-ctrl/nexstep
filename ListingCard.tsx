import { Link } from 'react-router-dom'
import { Calendar, Clock } from 'lucide-react'
import Badge from './ui/Badge'
import CardApply from './CardApply'
import { formatDateTime, formatPrice } from '../lib/format'
import { TYPE_META } from '../lib/listings'
import type { ListingView } from '../lib/listings'

export default function ListingCard({ l }: { l: ListingView }) {
  const meta = TYPE_META[l.type]
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200 transition-all hover:-translate-y-1 hover:shadow-xl">
      {l.imageUrl ? (
        <img src={l.imageUrl} alt={`Poster for ${l.title}`} className="h-36 w-full object-cover" loading="lazy" />
      ) : (
        <div className="flex h-36 items-end bg-gradient-to-br from-brand-50 to-slate-100 p-4">
          <span className="text-3xl font-extrabold text-brand-600/40">{l.category}</span>
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex flex-wrap gap-2">
          <Badge tone={l.upcoming ? 'violet' : 'slate'}>{l.phase === 'upcoming' ? 'Upcoming' : l.phase === 'cancelled' ? 'Cancelled' : 'Completed'}</Badge>
          <Badge tone="slate">{meta.singular}</Badge>
          <Badge tone={l.price === 0 ? 'green' : 'amber'}>{formatPrice(l.price)}</Badge>
          {!l.upcoming && l.recordingLink && <Badge tone="green">Recording available</Badge>}
        </div>
        <h3 className="text-lg font-bold text-ink-900">{l.title}</h3>
        <p className="line-clamp-2 text-sm">{l.description}</p>
        <p className="text-sm font-medium text-ink-900">{l.instructor}</p>
        <div className="mt-auto space-y-1 text-xs text-slate-500">
          <p className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{l.phase === 'completed' ? 'Held on ' : ''}{formatDateTime(l.startsAt, l.timeZone)}</p>
          <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{l.duration}</p>
        </div>
        <div className="grid gap-2">
          <Link to={`${meta.path}/${l.id}`} className="rounded-xl bg-ink-900 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-700">View Details</Link>
          <CardApply l={l} />
        </div>
      </div>
    </article>
  )
}
