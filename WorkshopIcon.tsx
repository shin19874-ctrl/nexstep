import { Landmark, Briefcase, Megaphone, Code2, Sparkles, Mic, Rocket } from 'lucide-react'
import type { Workshop } from '../types'

const icons = {
  finance: Landmark, business: Briefcase, marketing: Megaphone, technology: Code2,
  ai: Sparkles, communication: Mic, entrepreneurship: Rocket,
}

export default function WorkshopIcon({ name }: { name: Workshop['icon'] }) {
  const Icon = icons[name]
  return <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Icon className="h-5 w-5" /></span>
}
