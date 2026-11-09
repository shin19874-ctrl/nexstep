import { useCallback, useEffect, useState } from 'react'
import Button from './ui/Button'
import ApplyModal from './ApplyModal'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import { TYPE_META } from '../lib/listings'
import type { ListingView } from '../lib/listings'

export default function ApplyButton({ l }: { l: ListingView }) {
  const { user, loading } = useAuth()
  const [status, setStatus] = useState<string | null>(null)
  const [seatsLeft, setSeatsLeft] = useState<number | null>(null)
  const [open, setOpen] = useState(false)

  const refresh = useCallback(() => {
    supabase.rpc('seats_left', { wid: l.id }).then(({ data }) => setSeatsLeft(typeof data === 'number' ? data : null))
    if (user) supabase.from('applications').select('status').eq('webinar_id', l.id).maybeSingle().then(({ data }) => setStatus(data?.status ?? null))
  }, [l.id, user])
  useEffect(refresh, [refresh])

  const closed = l.deadline !== null && l.deadline.getTime() <= Date.now()
  const next = encodeURIComponent(`${TYPE_META[l.type].path}/${l.id}`)
  const box = 'rounded-2xl p-4 text-sm'
  return (
    <div className="space-y-3">
      {seatsLeft !== null && seatsLeft > 0 && <p className="text-sm font-medium text-ink-900">{seatsLeft} seat{seatsLeft > 1 ? 's' : ''} left</p>}
      {status === 'approved' ? <p className={`${box} bg-emerald-50 font-medium text-emerald-700`}>Your seat is confirmed.</p>
        : status === 'rejected' ? <p className={`${box} bg-slate-50`}>Your application was not accepted this time.</p>
        : status === 'pending' ? <p className={`${box} bg-brand-50 font-medium text-brand-700`}>Application received. You will be notified by email once your seat is confirmed.</p>
        : closed ? <p className={`${box} bg-slate-50`}>Applications are closed for this session.</p>
        : seatsLeft === 0 ? <p className={`${box} bg-slate-50`}>This session is full.</p>
        : !user && !loading ? <Button to={`/login?next=${next}`}>Log in to Apply Now</Button>
        : <Button onClick={() => setOpen(true)} disabled={loading}>Apply Now</Button>}
      {l.isPaid && <p className="text-xs text-slate-500">This is a paid session. Applying takes no payment; payment details are shared separately by the organiser.</p>}
      {l.registrationLink && <a href={l.registrationLink} target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-semibold text-brand-700 hover:underline">Open external booking link</a>}
      {open && <ApplyModal l={l} onClose={() => setOpen(false)} onApplied={refresh} />}
    </div>
  )
}
