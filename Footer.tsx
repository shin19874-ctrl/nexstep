import { Link } from 'react-router-dom'
import { Linkedin } from 'lucide-react'
import Logo from './Logo'
import { useAuth } from '../lib/AuthContext'
import { navLinks, founderEmail, linkedinUrl } from '../data/site'

export default function Footer() {
  const { isAdmin } = useAuth()
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo />
          <p className="mt-3 max-w-sm text-sm">Webinars, workshops and short courses that connect students with industry professionals.</p>
        </div>
        <div>
          <h3 className="text-sm font-bold text-ink-900">Explore</h3>
          <ul className="mt-3 space-y-2 text-sm">{navLinks.map(l => <li key={l.to}><Link className="hover:text-brand-700" to={l.to}>{l.label}</Link></li>)}</ul>
        </div>
        <div>
          <h3 className="text-sm font-bold text-ink-900">Founder's Email</h3>
          <p className="mt-3 text-sm"><a className="font-medium text-brand-700 hover:underline" href={`mailto:${founderEmail}`}>{founderEmail}</a></p>
          <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="NEXSTEP founder on LinkedIn"
            className="mt-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white text-brand-700 ring-1 ring-slate-200 hover:ring-brand-500"><Linkedin className="h-5 w-5" /></a>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-slate-200 px-4 py-4 text-xs">
        <span>© {new Date().getFullYear()} NEXSTEP. Take your next step towards your career.</span>
        {isAdmin && <Link to="/admin" className="hover:text-brand-700">Admin</Link>}
      </div>
    </footer>
  )
}
