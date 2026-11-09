export const formatDateTime = (d: Date, timeZone = 'Asia/Kolkata') =>
  d.toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit',
    timeZone, timeZoneName: 'short',
  })

export const formatPrice = (p: number) => (p === 0 ? 'Free' : `₹${p}`)

// Date and time pieces of a moment as seen in a given time zone (for edit forms).
export function partsInTz(d: Date, timeZone: string) {
  return {
    date: d.toLocaleDateString('en-CA', { timeZone }),
    time: d.toLocaleTimeString('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hour12: false }),
  }
}
