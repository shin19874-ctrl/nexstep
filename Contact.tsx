import { Mail, Linkedin } from 'lucide-react'
import { founderEmail, linkedinUrl } from '../data/site'

export default function Contact() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-extrabold text-ink-900">Contact</h1>
      <p className="mt-2">Questions about a session or interested in speaking? Reach out to the founder.</p>
      <ul className="mt-8 space-y-4">
        <li className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <Mail className="h-5 w-5 text-brand-600" />
          <span className="text-sm"><span className="font-semibold text-ink-900">Founder's Email: </span>
            <a href={`mailto:${founderEmail}`} className="font-medium text-brand-700 hover:underline">{founderEmail}</a></span>
        </li>
        <li className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
          <Linkedin className="h-5 w-5 text-brand-600" />
          <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-brand-700 hover:underline">Follow NEXSTEP on LinkedIn</a>
        </li>
      </ul>
    </div>
  )
}
