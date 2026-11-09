import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Logo from './Logo'
import Button from './ui/Button'
import { useAuth } from '../lib/AuthContext'
import { navLinks } from '../data/site'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  const authLink = user ? { to: '/account', label: 'My Account' } : { to: '/login', label: 'Login / Sign up' }
  const linkCls = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-brand-700' : 'text-slate-600 hover:text-ink-900'}`

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3" aria-label="Main">
        <Logo />
        <div className="hidden items-center gap-7 md:flex">
          {navLinks.map(l => <NavLink key={l.to} to={l.to} end className={linkCls}>{l.label}</NavLink>)}
          <NavLink to={authLink.to} className={linkCls}>{authLink.label}</NavLink>
          <Button to="/webinars" className="!py-2">Explore Events</Button>
        </div>
        <button className="text-ink-900 md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
          {open ? <X /> : <Menu />}
        </button>
      </nav>
      {open && (
        <div className="flex flex-col gap-4 border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          {navLinks.map(l => <NavLink key={l.to} to={l.to} end className={linkCls} onClick={() => setOpen(false)}>{l.label}</NavLink>)}
          <NavLink to={authLink.to} className={linkCls} onClick={() => setOpen(false)}>{authLink.label}</NavLink>
          <Button to="/webinars" onClick={() => setOpen(false)}>Explore Events</Button>
        </div>
      )}
    </header>
  )
}
