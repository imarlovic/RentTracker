/** Booking.com host-email parser (new / modified / cancelled / messaging). */

export type BookingEmailAction = 'created' | 'modified' | 'canceled' | 'unknown'

export type ParsedBookingEmail = {
  action: BookingEmailAction
  reservationNumber: string | null
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

const HR_MONTHS: Record<string, string> = {
  sij: '01',
  velj: '02',
  ozu: '03',
  ožu: '03',
  tra: '04',
  svi: '05',
  lip: '06',
  srp: '07',
  kol: '08',
  ruj: '09',
  lis: '10',
  stu: '11',
  pro: '12',
}

const EN_MONTHS: Record<string, string> = {
  jan: '01',
  feb: '02',
  mar: '03',
  apr: '04',
  may: '05',
  jun: '06',
  jul: '07',
  aug: '08',
  sep: '09',
  oct: '10',
  nov: '11',
  dec: '12',
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

function detectAction(subject: string, body: string): BookingEmailAction {
  const hay = `${subject}\n${body}`.toLowerCase()
  if (
    /cancel|cancell|has been cancelled|was cancelled|reservation cancelled|storno|otkazan/.test(
      hay,
    )
  ) {
    return 'canceled'
  }
  if (
    /modif|changed|updated reservation|reservation update|amendment|izmjena rezervacije|izmenjena rezervacija/.test(
      hay,
    )
  ) {
    return 'modified'
  }
  // Guest messaging / request confirmations are enrichment, not new bookings.
  if (
    /poruku od gosta|message from guest|guest received an automatic reply|request has been confirmed|nova poruka od gosta|messaging/.test(
      hay,
    )
  ) {
    return 'unknown'
  }
  if (
    /new booking|new reservation|confirmed reservation|reservation confirmation|you have a new|nova rezervacija|nova booking/.test(
      hay,
    )
  ) {
    return 'created'
  }
  return 'unknown'
}

export function parseDateLoose(raw: string): string | null {
  const cleaned = raw.trim().replace(/\s+/g, ' ')

  const iso = cleaned.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (iso) {
    return `${iso[1]}-${iso[2]}-${iso[3]}`
  }

  // English: "Fri 21 Nov 2025" or "21 Nov 2025"
  const en = cleaned.match(
    /(?:(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*)?\s*,?\s*(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{4})/i,
  )
  if (en) {
    const month = EN_MONTHS[en[2].slice(0, 3).toLowerCase()]
    if (month) {
      return `${en[3]}-${month}-${en[1].padStart(2, '0')}`
    }
  }

  // Croatian: "ned, 19. lis. 2025." or "19. lis. 2025"
  const hr = cleaned.match(
    /(?:(?:pon|uto|sri|čet|cet|pet|sub|ned)[a-z]*)?\s*,?\s*(\d{1,2})\.\s*(sij|velj|ožu|ozu|tra|svi|lip|srp|kol|ruj|lis|stu|pro)[a-z]*\.?\s*(\d{4})\.?/i,
  )
  if (hr) {
    const key = hr[2]
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .slice(0, 3)
    const month = HR_MONTHS[key] || HR_MONTHS[hr[2].toLowerCase().slice(0, 3)]
    if (month) {
      return `${hr[3]}-${month}-${hr[1].padStart(2, '0')}`
    }
  }

  // Numeric DMY: 19.10.2025 or 19/10/2025
  const dmy = cleaned.match(/(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})/)
  if (dmy) {
    return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`
  }

  // Numeric MDY with month name first: Nov 21, 2025
  const mdy = cleaned.match(
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})/i,
  )
  if (mdy) {
    const month = EN_MONTHS[mdy[1].slice(0, 3).toLowerCase()]
    if (month) {
      return `${mdy[3]}-${month}-${mdy[2].padStart(2, '0')}`
    }
  }

  return null
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

export function parseBookingEmail(input: {
  subject?: string | null
  bodyText?: string | null
  bodyHtml?: string | null
}): ParsedBookingEmail {
  const subject = normalizeText(input.subject ?? '')
  const body = normalizeText(
    [input.bodyText ?? '', input.bodyHtml ? stripHtml(input.bodyHtml) : '']
      .filter(Boolean)
      .join('\n'),
  )
  const text = `${subject}\n${body}`
  const action = detectAction(subject, body)

  const reservationNumber = firstMatch(text, [
    /(?:confirmation\s+number|booking\s+number|reservation\s+number|broj\s+potvrde|broj\s+rezervacije)\s*[:#]?\s*([0-9]{8,12})/i,
    /(?:reservation|booking)\s*(?:number|no\.?|id|#)\s*[:#]?\s*([0-9]{8,12})/i,
  ])

  const guestName = firstMatch(text, [
    /(?:guest\s+name|ime\s+gosta|booked\s+by|customer)\s*[:\-]?\s*([\p{L}][\p{L}' .-]{1,79})/iu,
    /(?:dear\s+partner[, ]+)?(?:new reservation for|reservation for)\s+([\p{L}][\p{L}' .-]{1,79})/iu,
  ])

  const startDate = firstParsableDate(text, [
    /(?:check[\s\-]?in|arrival|prijava)\s*[:\-]?\s*([^\n]{4,50})/gi,
  ])
  const endDate = firstParsableDate(text, [
    /(?:check[\s\-]?out|departure|odjava)\s*[:\-]?\s*([^\n]{4,50})/gi,
  ])

  const bookingDate = firstParsableDate(text, [
    /(?:booking\s+date|booked\s+on|reserved\s+on)\s*[:\-]?\s*([^\n]{4,50})/gi,
  ])

  const priceRaw = firstMatch(text, [
    /(?:total\s+price|price|amount|payout|you(?:'| wi)?ll\s+receive|ukupna\s+cijena)\s*[:\-]?\s*([€$£A-Z]{0,3}\s*[0-9][0-9.,\s]*[A-Z]{0,3})/i,
  ])
  const commissionRaw = firstMatch(text, [
    /(?:commission|booking\.com\s+fee|provizija)\s*[:\-]?\s*([€$£A-Z]{0,3}\s*[0-9][0-9.,\s]*[A-Z]{0,3})/i,
  ])
  const priceParsed = priceRaw ? parseMoney(priceRaw) : null
  const commissionParsed = commissionRaw ? parseMoney(commissionRaw) : null

  const adultsRaw = firstMatch(text, [/(?:adults?|odrasli)\s*[:\-]?\s*(\d{1,2})/i])
  const childrenRaw = firstMatch(text, [/(?:children|kids|djeca|deca)\s*[:\-]?\s*(\d{1,2})/i])
  const peopleRaw = firstMatch(text, [
    /(?:total\s+guests|ukupan\s+br\.?\s*gostiju|guests?|occupancy)\s*[:\-]?\s*(\d{1,2})/i,
  ])
  const adults = adultsRaw ? Number(adultsRaw) : null
  const children = childrenRaw ? Number(childrenRaw) : null
  const people =
    peopleRaw != null
      ? Number(peopleRaw)
      : adults != null || children != null
        ? (adults ?? 0) + (children ?? 0)
        : null

  const country = firstMatch(text, [
    /(?:guest\s+)?(?:country|nationality|država|drzava)\s*[:\-]?\s*([A-Za-zÀ-ÖØ-öø-ÿ ]{2,40})/i,
  ])

  let confidence: ParsedBookingEmail['confidence'] = 'low'
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
