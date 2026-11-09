import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import WorkshopIcon from './WorkshopIcon'
import type { Workshop } from '../types'

export default function WorkshopCard({ w }: { w: Workshop }) {
  return (
    <Link to={`/workshops?category=${encodeURIComponent(w.title)}`}
      className="group rounded-2xl bg-white p-6 ring-1 ring-slate-200 transition-all hover:-translate-y-1 hover:shadow-xl hover:ring-brand-500">
      <WorkshopIcon name={w.icon} />
      <div className="flex items-start justify-between">
        <h3 className="font-bold text-ink-900">{w.title}</h3>
        <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-brand-600" />
      </div>
      <p className="mt-1 text-sm">{w.description}</p>
    </Link>
  )
}
