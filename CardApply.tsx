import { useState } from 'react'
import { Link } from 'react-router-dom'
import ApplyModal from './ApplyModal'
import { useAuth } from '../lib/AuthContext'
import { TYPE_META } from '../lib/listings'
import type { ListingView } from '../lib/listings'

const cls = 'rounded-xl bg-brand-600 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-700'

// "Apply Now" on every upcoming card. Closed and past sessions do not show it.
export default function CardApply({ l }: { l: ListingView }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  if (l.phase !== 'upcoming' || (l.deadline && l.deadline.getTime() <= Date.now())) return null
  if (!user) return <Link to={`/login?next=${encodeURIComponent(`${TYPE_META[l.type].path}/${l.id}`)}`} className={cls}>Apply Now</Link>
  return (<>
    <button type="button" className={cls} onClick={() => setOpen(true)}>Apply Now</button>
    {open && <ApplyModal l={l} onClose={() => setOpen(false)} />}
  </>)
}
