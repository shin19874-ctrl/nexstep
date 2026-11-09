import { useParams, Link } from 'react-router-dom'
import { Calendar, Clock, User, MapPin } from 'lucide-react'
import { useListings } from '../lib/ListingsContext'
import { TYPE_META } from '../lib/listings'
import { formatDateTime, formatPrice } from '../lib/format'
import Badge from '../components/ui/Badge'
import ApplyButton from '../components/ApplyButton'
import NotFound from './NotFound'
import type { Kind } from '../lib/listings'

const formats = { online: 'Online', in_person: 'In person', hybrid: 'Hybrid (online and in person)' }

export default function ListingDetail({ type }: { type: Kind }) {
  const { id } = useParams()
  const { listings, loading } = useListings()
  const meta = TYPE_META[type]
  if (loading) return <p className="px-4 py-16 text-center text-slate-500">Loading…</p>
  const l = listings.find(x => x.id === id && x.type === type)
  if (!l) return <NotFound />
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link to={meta.path} className="text-sm font-semibold text-brand-700 hover:underline">← All {meta.plural.toLowerCase()}</Link>
      {l.imageUrl && <img src={l.imageUrl} alt={`Poster for ${l.title}`} className="mt-4 max-h-[28rem] w-full rounded-2xl object-cover" />}
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone={l.phase === 'upcoming' ? 'violet' : 'slate'}>{l.phase === 'upcoming' ? 'Upcoming' : l.phase === 'cancelled' ? 'Cancelled' : 'Completed'}</Badge>
        <Badge tone="slate">{meta.singular}</Badge><Badge tone="slate">{l.category}</Badge>
        <Badge tone={l.price === 0 ? 'green' : 'amber'}>{formatPrice(l.price)}</Badge>
      </div>
      <h1 className="mt-3 text-3xl font-extrabold text-ink-900">{l.title}</h1>
      <p className="mt-3 whitespace-pre-line text-lg">{l.description}</p>
      <ul className="mt-6 space-y-2 text-sm">
        <li className="flex items-center gap-2"><User className="h-4 w-4 text-brand-600" />{l.instructor}</li>
        <li className="flex items-center gap-2"><Calendar className="h-4 w-4 text-brand-600" />{formatDateTime(l.startsAt, l.timeZone)}</li>
        <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-brand-600" />{l.duration}</li>
        <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-600" />{formats[l.meetingFormat]}</li>
        {l.deadline && <li className="text-slate-500">Register by {formatDateTime(l.deadline, l.timeZone)}</li>}
      </ul>
      {l.speakerDetails && <div className="mt-6"><h2 className="font-bold text-ink-900">About the speaker</h2><p className="mt-1 whitespace-pre-line text-sm">{l.speakerDetails}</p></div>}
      <div className="mt-8">
        {l.phase === 'upcoming' && <ApplyButton l={l} />}
        {l.phase === 'cancelled' && <p className="rounded-2xl bg-slate-50 p-5 text-sm">This session has been cancelled.</p>}
        {l.phase === 'completed' && (
          <div className="rounded-2xl bg-slate-50 p-5 text-sm">
            <p>This session was conducted on <strong className="text-ink-900">{formatDateTime(l.startsAt, l.timeZone)}</strong>.</p>
            {l.recordingLink ? <a href={l.recordingLink} target="_blank" rel="noopener noreferrer"
              className="mt-4 inline-flex rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700">Watch Recording</a>
              : <p className="mt-2">A recording is not available for this session.</p>}
          </div>
        )}
      </div>
    </div>
  )
}
