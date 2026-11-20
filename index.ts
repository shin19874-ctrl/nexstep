// Sends NexStep emails through Resend. Needs secrets RESEND_API_KEY and FROM_EMAIL (see README).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' }
const TABLES: Record<string, string> = { webinar_applications: 'webinars', course_applications: 'courses', internship_applications: 'internships' }
const esc = (s: string) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, 'Content-Type': 'application/json' } })

const layout = (title: string, body: string) => `<div style="font-family:Arial,sans-serif;background:#f0f9ff;padding:24px">
<div style="max-width:560px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #dcf3ff">
<div style="background:#0A1F44;color:#fff;padding:20px 28px;font-size:22px;font-weight:bold">Nex<span style="color:#36c2f5">Step</span></div>
<div style="padding:28px;color:#334155;line-height:1.6"><h2 style="color:#0A1F44;margin-top:0">${title}</h2>${body}</div>
<div style="background:#f8fafc;padding:16px 28px;color:#64748b;font-size:12px">NexStep · Learn · Connect · Grow</div></div></div>`

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  try {
    const { type, table, id } = await req.json()
    const opp = TABLES[table]
    if (!opp || !['submitted', 'status'].includes(type)) return json({ error: 'Bad request' }, 400)
    const key = Deno.env.get('RESEND_API_KEY'), from = Deno.env.get('FROM_EMAIL')
    if (!key || !from) return json({ error: 'Email is not configured' }, 501)

    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    })
    // RLS means this only returns the row if the caller owns it or is admin.
    const { data: app } = await sb.from(table).select(`*, ${opp}(title)`).eq('id', id).maybeSingle()
    if (!app) return json({ error: 'Not found' }, 404)
    const { data: admin } = await sb.rpc('is_admin')
    const item = esc(app[opp]?.title ?? 'your selected opportunity'), name = esc(app.full_name)

    let subject = '', html = ''
    if (type === 'submitted') {
      if (app.status !== 'pending' || Date.now() - new Date(app.created_at).getTime() > 10 * 60 * 1000) return json({ error: 'Not allowed' }, 403)
      subject = 'We received your NexStep application'
      html = layout('Application received', `<p>Hi ${name},</p><p>Thank you for applying to <b>${item}</b>. Your application has been received and is now pending review. This is not a confirmation of your seat or enrollment. We will email you once a decision is made.</p>`)
    } else {
      if (admin !== true) return json({ error: 'Forbidden' }, 403)
      const msg: Record<string, [string, string]> = {
        accepted: ['Your NexStep application was accepted', `<p>Great news, ${name}! Your application for <b>${item}</b> has been <b style="color:#0b7fb8">accepted</b>. We will share further joining details with you shortly.</p>`],
        rejected: ['An update on your NexStep application', `<p>Hi ${name}, thank you for your interest in <b>${item}</b>. Unfortunately we are unable to offer you a place this time. We encourage you to apply to other opportunities on NexStep.</p>`],
        under_review: ['Your NexStep application is under review', `<p>Hi ${name}, your application for <b>${item}</b> is now <b>under review</b>. We will be in touch soon.</p>`],
      }
      if (!msg[app.status]) return json({ error: 'No email for this status' }, 400)
      subject = msg[app.status][0]; html = layout('Application update', msg[app.status][1])
    }
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [app.email], subject, html }),
    })
    if (!r.ok) return json({ error: 'Email provider error', detail: await r.text() }, 502)
    return json({ ok: true })
  } catch (e) { return json({ error: String(e) }, 500) }
})
