import { supabase } from './supabase'

export type Kind = 'webinar' | 'workshop' | 'course'
export type Status = 'draft' | 'published' | 'cancelled'

export const TYPE_META: Record<Kind, { singular: string; plural: string; path: string }> = {
  webinar: { singular: 'Webinar', plural: 'Webinars', path: '/webinars' },
  workshop: { singular: 'Workshop', plural: 'Workshops', path: '/workshops' },
  course: { singular: 'Short Course', plural: 'Short Courses', path: '/courses' },
}

// Fixed-offset zones only, so times convert correctly without daylight-saving surprises.
export const ZONES = [
  { id: 'Asia/Kolkata', label: 'India (IST, UTC+05:30)', offset: '+05:30' },
  { id: 'UTC', label: 'UTC', offset: '+00:00' },
  { id: 'Asia/Dubai', label: 'Dubai (UTC+04:00)', offset: '+04:00' },
  { id: 'Asia/Singapore', label: 'Singapore (UTC+08:00)', offset: '+08:00' },
]

export interface WebinarRow {
  id: string; kind: Kind; title: string; description: string; speaker_name: string; speaker_details: string
  category: string; start_at: string; end_at: string; time_zone: string; registration_deadline: string | null
  meeting_format: 'online' | 'in_person' | 'hybrid'; is_paid: boolean; price: number
  registration_link: string | null; recording_url: string | null; poster_path: string | null
  seats: number | null; status: Status
}

export interface ListingView {
  id: string; type: Kind; title: string; description: string; category: string
  instructor: string; speakerDetails: string
  startsAt: Date; endsAt: Date; timeZone: string; deadline: Date | null
  meetingFormat: WebinarRow['meeting_format']; isPaid: boolean; price: number
  registrationLink?: string; recordingLink?: string; imageUrl?: string; posterPath?: string
  seats: number | null; status: Status
  phase: 'upcoming' | 'completed' | 'cancelled'; upcoming: boolean; duration: string
}

function durationText(a: Date, b: Date) {
  const m = Math.round((b.getTime() - a.getTime()) / 60000)
  if (m < 60) return `${m} minutes`
  const h = Math.floor(m / 60), r = m % 60
  return `${h} hour${h > 1 ? 's' : ''}${r ? ` ${r} minutes` : ''}`
}

export function toView(r: WebinarRow): ListingView {
  const startsAt = new Date(r.start_at), endsAt = new Date(r.end_at)
  const phase = r.status === 'cancelled' ? 'cancelled' : endsAt.getTime() > Date.now() ? 'upcoming' : 'completed'
  return {
    id: r.id, type: r.kind, title: r.title, description: r.description, category: r.category,
    instructor: r.speaker_name, speakerDetails: r.speaker_details, startsAt, endsAt, timeZone: r.time_zone,
    deadline: r.registration_deadline ? new Date(r.registration_deadline) : null,
    meetingFormat: r.meeting_format, isPaid: r.is_paid, price: Number(r.price),
    registrationLink: r.registration_link ?? undefined, recordingLink: r.recording_url ?? undefined,
    posterPath: r.poster_path ?? undefined,
    imageUrl: r.poster_path ? supabase.storage.from('posters').getPublicUrl(r.poster_path).data.publicUrl : undefined,
    seats: r.seats, status: r.status, phase, upcoming: phase === 'upcoming', duration: durationText(startsAt, endsAt),
  }
}

// Upcoming first (soonest first), then past/cancelled (most recent first).
export function sortViews(list: ListingView[]) {
  const up = list.filter(l => l.upcoming).sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
  const rest = list.filter(l => !l.upcoming).sort((a, b) => b.startsAt.getTime() - a.startsAt.getTime())
  return [...up, ...rest]
}

// Public site: published and cancelled only (drafts are never requested).
export async function fetchPublic(): Promise<ListingView[]> {
  const { data, error } = await supabase.from('webinars').select('*').in('status', ['published', 'cancelled'])
  if (error) throw error
  return sortViews((data as WebinarRow[]).map(toView))
}

// Admin dashboard: everything, including drafts (the database allows this for admins only).
export async function fetchAll(): Promise<ListingView[]> {
  const { data, error } = await supabase.from('webinars').select('*')
  if (error) throw error
  return sortViews((data as WebinarRow[]).map(toView))
}
