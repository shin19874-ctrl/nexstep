import { Link } from 'react-router-dom'

export default function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="NEXSTEP home">
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden>
        <rect x="2" y="16" width="6" height="8" rx="1.5" className="fill-brand-400" />
        <rect x="10" y="9" width="6" height="15" rx="1.5" className="fill-brand-500" />
        <rect x="18" y="2" width="6" height="22" rx="1.5" className="fill-brand-700" />
      </svg>
      <span className="text-xl font-extrabold tracking-tight text-ink-900">NEX<span className="text-brand-600">STEP</span></span>
    </Link>
  )
}
