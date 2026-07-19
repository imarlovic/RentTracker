/** Booking.com host-email parser (new / modified / cancelled). */

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
    /cancel|cancell|has been cancelled|was cancelled|reservation cancelled|storno/.test(hay)
  ) {
    return 'canceled'
  }
  if (/modif|changed|updated reservation|reservation update|amendment/.test(hay)) {
    return 'modified'
  }
  if (/new booking|new reservation|confirmed reservation|reservation confirmation|you have a new/.test(hay)) {
    return 'created'
  }
  return 'unknown'
}

function parseDateLoose(raw: string): string | null {
  const cleaned = raw.trim()
  const iso = cleaned.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (iso) {
    return `${iso[1]}-${iso[2]}-${iso[3]}`
  }
  const dmy = cleaned.match(/(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})/)
  if (dmy) {
    const day = dmy[1].padStart(2, '0')
    const month = dmy[2].padStart(2, '0')
    return `${dmy[3]}-${month}-${day}`
  }
  const mdy = cleaned.match(
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2}),?\s+(\d{4})/i,
  )
  if (mdy) {
    const months: Record<string, string> = {
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
    const month = months[mdy[1].slice(0, 3).toLowerCase()]
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
    (match[1] || match[4] || (symbol === '€' ? 'EUR' : symbol === '$' ? 'USD' : symbol === '£' ? 'GBP' : null))?.toUpperCase() ??
    null
  return { amount, currency }
}

export function parseBookingEmail(input: {
  subject?: string | null
  bodyText?: string | null
  bodyHtml?: string | null
}): ParsedBookingEmail {
  const subject = normalizeText(input.subject ?? '')
  const body = normalizeText(
    [input.bodyText ?? '', input.bodyHtml ? stripHtml(input.bodyHtml) : ''].filter(Boolean).join('\n'),
  )
  const text = `${subject}\n${body}`
  const action = detectAction(subject, body)

  const reservationNumber = firstMatch(text, [
    /(?:reservation|booking)\s*(?:number|no\.?|id|#)\s*[:#]?\s*([0-9]{8,12})/i,
    /\b([0-9]{8,12})\b/,
  ])

  const guestName = firstMatch(text, [
    /(?:guest(?:'s)?\s+name|booked\s+by|customer|traveller|traveler)\s*[:\-]?\s*([A-Za-zÀ-ÖØ-öø-ÿ' -]{2,80})/i,
    /(?:dear\s+partner[, ]+)?(?:new reservation for|reservation for)\s+([A-Za-zÀ-ÖØ-öø-ÿ' -]{2,80})/i,
  ])

  const startRaw = firstMatch(text, [
    /(?:check[\s\-]?in|arrival|from)\s*[:\-]?\s*([A-Za-z0-9,\/.\- ]{6,30})/i,
  ])
  const endRaw = firstMatch(text, [
    /(?:check[\s\-]?out|departure|to|until)\s*[:\-]?\s*([A-Za-z0-9,\/.\- ]{6,30})/i,
  ])
  const startDate = startRaw ? parseDateLoose(startRaw) : null
  const endDate = endRaw ? parseDateLoose(endRaw) : null

  const bookingRaw = firstMatch(text, [
    /(?:booking\s+date|booked\s+on|reserved\s+on)\s*[:\-]?\s*([A-Za-z0-9,\/.\- ]{6,30})/i,
  ])
  const bookingDate = bookingRaw ? parseDateLoose(bookingRaw) : null

  const priceRaw = firstMatch(text, [
    /(?:total\s+price|price|amount|payout|you(?:'| wi)?ll\s+receive)\s*[:\-]?\s*([€$£A-Z]{0,3}\s*[0-9][0-9.,\s]*[A-Z]{0,3})/i,
  ])
  const commissionRaw = firstMatch(text, [
    /(?:commission|booking\.com\s+fee)\s*[:\-]?\s*([€$£A-Z]{0,3}\s*[0-9][0-9.,\s]*[A-Z]{0,3})/i,
  ])
  const priceParsed = priceRaw ? parseMoney(priceRaw) : null
  const commissionParsed = commissionRaw ? parseMoney(commissionRaw) : null

  const adultsRaw = firstMatch(text, [/(?:adults?)\s*[:\-]?\s*(\d{1,2})/i])
  const childrenRaw = firstMatch(text, [/(?:children|kids)\s*[:\-]?\s*(\d{1,2})/i])
  const peopleRaw = firstMatch(text, [/(?:guests?|occupancy)\s*[:\-]?\s*(\d{1,2})/i])
  const adults = adultsRaw ? Number(adultsRaw) : null
  const children = childrenRaw ? Number(childrenRaw) : null
  const people =
    peopleRaw != null
      ? Number(peopleRaw)
      : adults != null || children != null
        ? (adults ?? 0) + (children ?? 0)
        : null

  const country = firstMatch(text, [
    /(?:guest\s+)?(?:country|nationality)\s*[:\-]?\s*([A-Za-zÀ-ÖØ-öø-ÿ ]{2,40})/i,
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
