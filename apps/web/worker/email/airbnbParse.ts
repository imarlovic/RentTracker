/** Airbnb host-email parser (confirmed / altered / cancelled). EN + HR templates. */

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
  const subjectLc = subject.toLowerCase()
  const bodyLc = body.toLowerCase()

  // Subject wins: confirmation / cancellation / alteration headlines.
  if (
    /rezervacija je potvrđena|reservation confirmed|booking confirmed|confirmed reservation|potvrđena je nova rezervacija|nova rezervacija/.test(
      subjectLc,
    )
  ) {
    return 'created'
  }
  if (
    /rezervacija (je )?otkaz|reservation cancel|booking cancel|has been cancelled|has been canceled|was cancelled|was canceled/.test(
      subjectLc,
    )
  ) {
    return 'canceled'
  }
  if (
    /rezervacija (je )?(izmijen|izmen|promijen|promen)|reservation (alter|modif|changed|updated)|altered reservation/.test(
      subjectLc,
    )
  ) {
    return 'modified'
  }

  // Body: real cancellation of this stay (not the "cancellation policy" footer).
  if (
    /(?:this reservation (?:has been|was) cancel|reservation (?:has been|was) cancel|booking (?:has been|was) cancel|gost je otkazao|otkazana je rezervacija|rezervacija je otkazana)/i.test(
      bodyLc,
    )
  ) {
    return 'canceled'
  }
  if (
    /(?:reservation (?:has been )?(?:alter|modif|chang)|rezervacija je (?:izmijen|izmen|promijen|promen))/i.test(
      bodyLc,
    )
  ) {
    return 'modified'
  }
  if (
    /(?:potvrđena je nova rezervacija|reservation confirmed|you have a new reservation|new reservation confirmed|rezervacija je potvrđena)/i.test(
      bodyLc,
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

function firstParsableDate(
  text: string,
  patterns: RegExp[],
  opts?: { referenceYear?: number; referenceDate?: Date },
): string | null {
  for (const pattern of patterns) {
    const flags = pattern.flags.includes('g') ? pattern.flags : `${pattern.flags}g`
    const global = new RegExp(pattern.source, flags)
    let match: RegExpExecArray | null
    while ((match = global.exec(text)) !== null) {
      const parsed = parseDateLoose(match[1] ?? '', opts)
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
    /(?:(EUR|USD|GBP|HRK|CHF|PLN|CZK)|([€$£]))?\s*([0-9]+(?:[.,][0-9]{1,2})?)\s*(?:(EUR|USD|GBP|HRK|CHF|PLN|CZK)|([€$£]))?/i,
  )
  if (!match) {
    return null
  }
  const amount = Number(match[3].replace(',', '.'))
  if (Number.isNaN(amount)) {
    return null
  }
  const symbol = match[2] || match[5]
  const currency =
    (
      match[1] ||
      match[4] ||
      (symbol === '€' ? 'EUR' : symbol === '$' ? 'USD' : symbol === '£' ? 'GBP' : null)
    )?.toUpperCase() ?? null
  return { amount, currency }
}

const HR_WEEKDAY = 'pon|uto|sri|čet|cet|pet|sub|ned'
const HR_MONTH = 'sij|velj|ožu|ozu|tra|svi|lip|srp|kol|ruj|lis|stu|pro'
const HR_DATE = `(?:(?:${HR_WEEKDAY})[a-z]*)?\\s*,?\\s*\\d{1,2}\\.\\s*(?:${HR_MONTH})[a-z]*\\.?`

function extractConfirmationCode(text: string): string | null {
  const labeled = firstMatch(text, [
    /(?:konfirmacijski\s+kod|confirmation\s+code|confirmation\s+number|reservation\s+code)\s*[:#]?\s*\n?\s*([A-Z0-9]{8,12})\b/i,
    /\/reservations\/details\/([A-Z0-9]{8,12})\b/i,
  ])
  if (labeled && /^[A-Z]{2}/i.test(labeled) && !/rezervacija|confirmation|airbnb/i.test(labeled)) {
    return labeled.toUpperCase()
  }

  // Prefer classic Airbnb codes (often HM…).
  const hm = text.match(/\b(HM[A-Z0-9]{6,10})\b/)
  if (hm) {
    return hm[1].toUpperCase()
  }

  return null
}

function extractGuestName(subject: string, body: string): string | null {
  const fromSubject = firstMatch(subject, [
    /rezervacija je potvrđena\s*[–—-]\s*([\p{L}][\p{L}' .-]{1,79}?)\s+dolazi\b/iu,
    /reservation confirmed\s*[–—-]\s*([\p{L}][\p{L}' .-]{1,79}?)\s+(?:arrives|is arriving)\b/iu,
    /^([\p{L}][\p{L}' .-]{1,79}?)(?:'s|’s)\s+reservation\b/iu,
  ])
  if (fromSubject) {
    return fromSubject.replace(/\s+/g, ' ').trim()
  }

  return firstMatch(body, [
    /(?:guest(?:'s)?\s+name|guest|traveler|traveller)\s*[:\-]?\s*([\p{L}][\p{L}' .-]{1,79})/iu,
    /(?:pošaljite poruku za|send a message to|message)\s*:\s*([\p{L}][\p{L}' .-]{1,40})/iu,
    /(?:reservation confirmed for|booking confirmed for)\s+([\p{L}][\p{L}' .-]{1,79})/iu,
  ])
}

function extractAirbnbDates(
  text: string,
  opts: { referenceYear?: number; referenceDate?: Date },
): { startDate: string | null; endDate: string | null } {
  // HR side-by-side: "Dolazak Odlazak\nuto, 20. lis sri, 21. lis"
  const hrPair = text.match(
    new RegExp(
      `Dolazak\\s+Odlazak\\s+(${HR_DATE})\\s+(${HR_DATE})`,
      'i',
    ),
  )
  if (hrPair) {
    return {
      startDate: parseDateLoose(hrPair[1], opts),
      endDate: parseDateLoose(hrPair[2], opts),
    }
  }

  // EN side-by-side: "Check-in Check-out\nTue, Oct 20 Wed, Oct 21"
  const enPair = text.match(
    /Check[\s\-]?in\s+Check[\s\-]?out\s+((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\s*,?\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:,?\s*\d{4})?)\s+((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\s*,?\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2}(?:,?\s*\d{4})?)/i,
  )
  if (enPair) {
    return {
      startDate: parseDateLoose(enPair[1], opts),
      endDate: parseDateLoose(enPair[2], opts),
    }
  }

  const startDate = firstParsableDate(
    text,
    [
      /(?:check[\s\-]?in|start\s+date|arrival|dolazak)\s*[:\-]?\s*([^\n]{4,50})/gi,
    ],
    opts,
  )
  const endDate = firstParsableDate(
    text,
    [
      /(?:check[\s\-]?out|end\s+date|departure|odlazak)\s*[:\-]?\s*([^\n]{4,50})/gi,
    ],
    opts,
  )
  return { startDate, endDate }
}

function extractGuestCounts(text: string): {
  adults: number | null
  children: number | null
  people: number | null
} {
  // "2 odrasle osobe, 2 bebe" / "2 adults, 1 child"
  const hr = text.match(
    /(\d{1,2})\s*odrasl\w*(?:\s+osobe?)?(?:\s*,\s*(\d{1,2})\s*(?:djece|djeca|dete|dječ\w*|bebe|beba))?/i,
  )
  if (hr) {
    const adults = Number(hr[1])
    const children = hr[2] != null ? Number(hr[2]) : 0
    return { adults, children, people: adults + children }
  }

  const enSplit = text.match(
    /(\d{1,2})\s*adults?(?:\s*,\s*(\d{1,2})\s*(?:children|child|kids|infants?))?/i,
  )
  if (enSplit) {
    const adults = Number(enSplit[1])
    const children = enSplit[2] != null ? Number(enSplit[2]) : 0
    return { adults, children, people: adults + children }
  }

  const peopleRaw = firstMatch(text, [
    /(?:number of guests|guests?|occupancy|gosti)\s*[:\-]?\s*(\d{1,2})/i,
  ])
  const adultsRaw = firstMatch(text, [/(?:adults?|odrasl\w*)\s*[:\-]?\s*(\d{1,2})/i])
  const childrenRaw = firstMatch(text, [
    /(?:children|kids|infants?|djece|djeca|bebe)\s*[:\-]?\s*(\d{1,2})/i,
  ])
  const adults = adultsRaw ? Number(adultsRaw) : null
  const children = childrenRaw ? Number(childrenRaw) : null
  const people =
    peopleRaw != null
      ? Number(peopleRaw)
      : adults != null || children != null
        ? (adults ?? 0) + (children ?? 0)
        : null
  return { adults, children, people }
}

function extractCountry(text: string): string | null {
  // "Solun, Grčka" / "Thessaloniki, Greece" near verified identity line
  const line = firstMatch(text, [
    /identitet je verificiran[^\n]*\n+\s*([^\n]+)/i,
    /identity\s+verified[^\n]*\n+\s*([^\n]+)/i,
  ])
  if (line) {
    const parts = line.split(',').map((p) => p.trim()).filter(Boolean)
    if (parts.length >= 2) {
      return parts[parts.length - 1]
    }
  }
  return null
}

export function parseAirbnbEmail(input: {
  subject?: string | null
  bodyText?: string | null
  bodyHtml?: string | null
  referenceDate?: Date | string | null
}): ParsedAirbnbEmail {
  const subject = normalizeText(input.subject ?? '')
  const body = normalizeText(
    [input.bodyText ?? '', input.bodyHtml ? stripHtml(input.bodyHtml) : '']
      .filter(Boolean)
      .join('\n'),
  )
  const text = `${subject}\n${body}`
  const action = detectAction(subject, body)

  const referenceDate =
    input.referenceDate instanceof Date
      ? input.referenceDate
      : typeof input.referenceDate === 'string' && input.referenceDate
        ? new Date(input.referenceDate)
        : undefined
  const dateOpts = {
    referenceYear: referenceDate?.getUTCFullYear() ?? new Date().getUTCFullYear(),
    referenceDate: Number.isFinite(referenceDate?.getTime()) ? referenceDate : undefined,
  }

  const reservationNumber = extractConfirmationCode(text)
  const guestName = extractGuestName(subject, body)
  const { startDate, endDate } = extractAirbnbDates(text, dateOpts)

  const bookingDate = firstParsableDate(
    text,
    [/(?:booked\s+on|booking\s+date|reserved\s+on)\s*[:\-]?\s*([^\n]{4,50})/gi],
    dateOpts,
  )

  const priceRaw = firstMatch(text, [
    /(?:vaša\s+zarada|vasha\s+zarada|you(?:'| wi)?ll\s+(?:earn|receive)|host\s+payout|payout|earnings|total\s+(?:payout|price))\s*[:\-]?\s*([€$£]?[A-Z]{0,3}\s*[0-9][0-9.,\s]*\s*[€$£]?[A-Z]{0,3})/i,
  ])
  const priceParsed = priceRaw ? parseMoney(priceRaw) : null

  const commissionRaw = firstMatch(text, [
    /(?:naknada za usluge koju plaća domaćin|host service fee)\s*(?:\([^)]*\))?\s*[−\-–]\s*([0-9]+(?:[.,][0-9]{1,2})\s*€?)/i,
    /(?:naknada za usluge koju plaća domaćin|host service fee)[^\n]*?[−\-–]\s*([0-9]+(?:[.,][0-9]{1,2})\s*€)/i,
  ])
  const commissionParsed = commissionRaw ? parseMoney(commissionRaw) : null

  const { adults, children, people } = extractGuestCounts(text)
  const country = extractCountry(text)

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
    commission: commissionParsed?.amount ?? null,
    currency: priceParsed?.currency ?? commissionParsed?.currency ?? null,
    adults,
    children,
    people,
    country,
    confidence,
  }
}
