export type EmailProvider = 'Booking' | 'Airbnb'

export function isEmailProvider(value: string): value is EmailProvider {
  return value === 'Booking' || value === 'Airbnb'
}

export function emailExternalIdPrefix(provider: EmailProvider): string {
  return provider === 'Airbnb' ? 'email:airbnb:' : 'email:booking:'
}

export function emailExternalId(
  provider: EmailProvider,
  reference: string | null,
  fallbackId: string,
): string {
  if (reference) {
    return `${emailExternalIdPrefix(provider)}${reference}`
  }
  return `${emailExternalIdPrefix(provider)}anon:${fallbackId}`
}

/** Infer OTA from message headers/body so one mailbox can feed both providers. */
export function detectEmailProvider(
  fromAddress?: string | null,
  subject?: string | null,
  bodyText?: string | null,
  bodyHtml?: string | null,
): EmailProvider | null {
  const hay = `${fromAddress ?? ''}\n${subject ?? ''}\n${bodyText ?? ''}\n${bodyHtml ?? ''}`.toLowerCase()
  const hasAirbnb =
    hay.includes('airbnb.com') ||
    hay.includes('airbnb.co') ||
    hay.includes('@airbnb') ||
    /\bairbnb\b/.test(hay)
  const hasBooking =
    hay.includes('booking.com') ||
    hay.includes('mchat.booking') ||
    hay.includes('@booking.com')

  if (hasAirbnb && !hasBooking) {
    return 'Airbnb'
  }
  if (hasBooking && !hasAirbnb) {
    return 'Booking'
  }
  if (hasAirbnb && hasBooking) {
    // Prefer the From domain when both names appear in the body
    const from = (fromAddress ?? '').toLowerCase()
    if (from.includes('airbnb')) {
      return 'Airbnb'
    }
    if (from.includes('booking')) {
      return 'Booking'
    }
    return 'Booking'
  }

  if (
    /confirmation code/.test(hay) ||
    /\bhm[a-z0-9]{6,}\b/.test(hay) ||
    /reservation confirmed/.test(hay)
  ) {
    return 'Airbnb'
  }

  if (
    hay.includes('broj rezervacije') ||
    hay.includes('broj potvrde') ||
    hay.includes('ime gosta') ||
    /confirmation number|booking number/.test(hay)
  ) {
    return 'Booking'
  }

  return null
}
