import type { ReactNode } from 'react'
import { CalendarX } from 'lucide-react'

export default function EmptyState({ title, text, action }: { title: string; text: string; action?: ReactNode }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
      <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600"><CalendarX /></span>
      <h3 className="font-bold text-ink-900">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
