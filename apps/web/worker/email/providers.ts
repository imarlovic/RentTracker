export type EmailProvider = 'Booking' | 'Airbnb'

export function isEmailProvider(value: string): value is EmailProvider {
  return value === 'Booking' || value === 'Airbnb'
}

export function emailExternalIdPrefix(provider: EmailProvider): string {
  return provider === 'Airbnb' ? 'email:airbnb:' : 'email:booking:'
}

export function emailExternalId(provider: EmailProvider, reference: string | null, fallbackId: string): string {
  if (reference) {
    return `${emailExternalIdPrefix(provider)}${reference}`
  }
  return `${emailExternalIdPrefix(provider)}anon:${fallbackId}`
}
