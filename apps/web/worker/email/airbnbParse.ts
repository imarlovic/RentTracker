/** Airbnb host-email parser (confirmed / altered / cancelled). */

import { parseDateLoose } from './bookingParse'

export type AirbnbEmailAction = 'created' | 'modified' | 'canceled' | 'unknown'

export type ParsedAirbnbEmail = {
  action: AirbnbEmailAction
  reservationNumber: string | null // confirmation code
  guestName: string | null
  startDate: string | null
  endDate: string | null
  bookingDate: string | null
  price: number | null
  commission: number | null
  currency: string | null
  adults: number | null
  children: number | null
  people: number | null
  country: string | null
  confidence: 'high' | 'medium' | 'low'
}

function normalizeText(input: string): string {
  return input
    .replace(/\r\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
}

function stripHtml(html: string): string {
  return normalizeText(
    html
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/tr>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n))),
  )
}

function detectAction(subject: string, body: string): AirbnbEmailAction {
  const hay = `${subject}\n${body}`.toLowerCase()
  if (
    /cancel|cancell|has been cancelled|was cancelled|reservation cancelled|reservation canceled/.test(
      hay,
    )
  ) {
    return 'canceled'
  }
  if (
    /alter|modif|changed|updated reservation|reservation update|reservation changed/.test(hay)
  ) {
    return 'modified'
  }
  if (
    /reservation confirmed|booking confirmed|confirmed reservation|you have a new reservation|new reservation|reservation request accepted/.test(
      hay,
    )
  ) {
    return 'created'
  }
  return 'unknown'
}

function firstMatch(text: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match?.[1]) {
      return match[1].trim()
    }
  }
  return null
}

function firstParsableDate(text: string, patterns: RegExp[]): string | null {
  for (const pattern of patterns) {
    const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`
    const global = new RegExp(pattern.source, flags)
    let match: RegExpExecArray | null
    while ((match = global.exec(text)) !== null) {
      const parsed = parseDateLoose(match[1] ?? '')
      if (parsed) {
        return parsed
      }
    }
  }
  return null
}

function parseMoney(raw: string): { amount: number; currency: string | null } | null {
  const cleaned = raw.replace(/\s/g, ' ').trim()
  const match = cleaned.match(
    /(?:(EUR|USD|GBP|HRK|CHF|PLN|CZK)|([€$£]))?\s*([0-9]+(?:[.,][0-9]{1,2})?)\s*(EUR|USD|GBP|HRK|CHF|PLN|CZK)?/i,
  )
  if (!match) {
    return null
  }
  const amount = Number(match[3].replace(',', '.'))
  if (Number.isNaN(amount)) {
    return null
  }
  const symbol = match[2]
  const currency =
    (
      match[1] ||
      match[4] ||
      (symbol === '€' ? 'EUR' : symbol === '$' ? 'USD' : symbol === '£' ? 'GBP' : null)
    )?.toUpperCase() ?? null
  return { amount, currency }
}

export function parseAirbnbEmail(input: {
  subject?: string | null
  bodyText?: string | null
  bodyHtml?: string | null
}): ParsedAirbnbEmail {
  const subject = normalizeText(input.subject ?? '')
  const body = normalizeText(
    [input.bodyText ?? '', input.bodyHtml ? stripHtml(input.bodyHtml) : '']
      .filter(Boolean)
      .join('\n'),
  )
  const text = `${subject}\n${body}`
  const action = detectAction(subject, body)

  // Confirmation codes are typically short alphanumeric (often start with letters).
  const reservationNumber = firstMatch(text, [
    /(?:confirmation\s+code|confirmation\s+number|reservation\s+code|code)\s*[:#]?\s*([A-Z0-9]{6,16})/i,
    /\(([A-Z0-9]{6,16})\)/,
    /\b([A-Z]{2}[A-Z0-9]{6,12})\b/,
  ])

  const guestName = firstMatch(text, [
    /(?:guest(?:'s)?\s+name|guest|traveler|traveller)\s*[:\-]?\s*([\p{L}][\p{L}' .-]{1,79})/iu,
    /(?:reservation confirmed for|booking confirmed for)\s+([\p{L}][\p{L}' .-]{1,79})/iu,
  ])

  const startDate = firstParsableDate(text, [
    /(?:check[\s\-]?in|start\s+date|arrival)\s*[:\-]?\s*([^\n]{4,50})/gi,
  ])
  const endDate = firstParsableDate(text, [
    /(?:check[\s\-]?out|end\s+date|departure)\s*[:\-]?\s*([^\n]{4,50})/gi,
  ])

  const bookingDate = firstParsableDate(text, [
    /(?:booked\s+on|booking\s+date|reserved\s+on)\s*[:\-]?\s*([^\n]{4,50})/gi,
  ])

  const priceRaw = firstMatch(text, [
    /(?:you(?:'| wi)?ll\s+(?:earn|receive)|host\s+payout|payout|earnings|total\s+(?:payout|price)|amount)\s*[:\-]?\s*([€$£A-Z]{0,3}\s*[0-9][0-9.,\s]*[A-Z]{0,3})/i,
  ])
  const priceParsed = priceRaw ? parseMoney(priceRaw) : null

  const peopleRaw = firstMatch(text, [
    /(?:number of guests|guests?|occupancy)\s*[:\-]?\s*(\d{1,2})/i,
  ])
  const adultsRaw = firstMatch(text, [/(?:adults?)\s*[:\-]?\s*(\d{1,2})/i])
  const childrenRaw = firstMatch(text, [/(?:children|kids)\s*[:\-]?\s*(\d{1,2})/i])
  const adults = adultsRaw ? Number(adultsRaw) : null
  const children = childrenRaw ? Number(childrenRaw) : null
  const people =
    peopleRaw != null
      ? Number(peopleRaw)
      : adults != null || children != null
        ? (adults ?? 0) + (children ?? 0)
        : null

  let confidence: ParsedAirbnbEmail['confidence'] = 'low'
  if (reservationNumber && startDate && endDate) {
    confidence = 'high'
  } else if (reservationNumber || (startDate && endDate)) {
    confidence = 'medium'
  }

  return {
    action,
    reservationNumber,
    guestName,
    startDate,
    endDate,
    bookingDate,
    price: priceParsed?.amount ?? null,
    commission: null,
    currency: priceParsed?.currency ?? null,
    adults,
    children,
    people,
    country: null,
    confidence,
  }
}
