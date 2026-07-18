/** Minimal iCal VEVENT parser for OTA calendar feeds. */

export type IcalEvent = {
  uid: string
  summary: string
  startDate: string // YYYY-MM-DD
  endDate: string
}

function unfold(ics: string): string {
  return ics.replace(/\r\n/g, '\n').replace(/\n[ \t]/g, '')
}

function parseDateValue(value: string): string | null {
  // DATE: 20260718 or DATE-TIME: 20260718T150000Z
  const raw = value.split(':').pop()?.trim() ?? ''
  const m = raw.match(/^(\d{4})(\d{2})(\d{2})/)
  if (!m) {
    return null
  }
  return `${m[1]}-${m[2]}-${m[3]}`
}

function getProp(block: string, name: string): string | null {
  const lines = block.split('\n')
  for (const line of lines) {
    if (line.startsWith(`${name}:`) || line.startsWith(`${name};`)) {
      const idx = line.indexOf(':')
      return idx >= 0 ? line.slice(idx + 1).trim() : null
    }
  }
  return null
}

export function parseIcalEvents(ics: string): IcalEvent[] {
  const text = unfold(ics)
  const events: IcalEvent[] = []
  const parts = text.split('BEGIN:VEVENT')

  for (let i = 1; i < parts.length; i++) {
    const block = parts[i].split('END:VEVENT')[0] ?? ''
    const uid = getProp(block, 'UID') ?? crypto.randomUUID()
    const summary = getProp(block, 'SUMMARY') ?? 'Reservation'
    const dtStart = getProp(block, 'DTSTART')
    const dtEnd = getProp(block, 'DTEND')
    const startDate = dtStart ? parseDateValue(dtStart) : null
    let endDate = dtEnd ? parseDateValue(dtEnd) : null

    if (!startDate) {
      continue
    }
    if (!endDate) {
      endDate = startDate
    }

    events.push({ uid, summary, startDate, endDate })
  }

  return events
}

export async function fetchIcal(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: { Accept: 'text/calendar, text/plain, */*' },
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch iCal (${response.status})`)
  }
  return response.text()
}
