/**
 * Booking host-email fixtures for parser / apply hardening.
 * Real templates are anonymized (fake names, booking numbers, property, emails).
 */

export const fixtureNewReservation = {
  subject: 'New booking - Reservation confirmation 4839201745',
  bodyText: `Dear partner,

You have a new reservation.

Guest name: Ana Petrovic
Check-in: 2026-08-12
Check-out: 2026-08-15
Reservation number: 4839201745
Booking date: 2026-07-01
Total price: EUR 420.00
Commission: EUR 63.00
Adults: 2
Children: 0
Country: Croatia

Thank you,
Booking.com`,
}

export const fixtureModifiedReservation = {
  subject: 'Modified reservation 4839201745',
  bodyText: `Reservation update

Guest name: Ana Petrovic
Check-in: 2026-08-13
Check-out: 2026-08-16
Reservation number: 4839201745
Total price: EUR 450.00
Commission: EUR 67.50
`,
}

export const fixtureCanceledReservation = {
  subject: 'Reservation 4839201745 has been cancelled',
  bodyText: `The following reservation was cancelled.

Guest name: Ana Petrovic
Check-in: 2026-08-13
Check-out: 2026-08-16
Reservation number: 4839201745
`,
}

export const fixtureHtmlReservation = {
  subject: 'Confirmed reservation 9911223344',
  bodyHtml: `<html><body>
<p>Booked by: <b>Marko Horvat</b></p>
<p>Arrival: 2026-09-01</p>
<p>Departure: 2026-09-04</p>
<p>Reservation number: 9911223344</p>
<p>Price: €310.00</p>
</body></html>`,
}

/** Anonymized from Booking Messaging "request has been confirmed" (EN). */
export const fixtureGuestRequestConfirmedEn = {
  subject: "Ana Horvat's request has been confirmed",
  bodyText: `Confirmation number: 1000000001

This guest received an automatic reply

Ana Horvat said:

I'd like to request check-in at 20:00 - 21:00. Is this ok?

Confirmed free of charge
You can change your automatic reply settings at any time.

Reservation details

Guest name:
Ana Horvat

Check-in:
Fri 21 Nov 2025

Check-out:
Sat 22 Nov 2025

Property name:
Sample Apartment Zagreb

Booking number:
1000000001

Total guests:
3

Total rooms:
1

© Copyright Booking.com 2025
This e-mail was sent by Booking.com

This email was delivered to: partner@example.com
`,
}

/** Anonymized from Booking Messaging guest message (HR). */
export const fixtureGuestMessageHr = {
  subject: 'Primili smo ovu poruku od gosta Marko Test',
  bodyText: `##- Molimo vas da napišete odgovor iznad ove crte -##

Broj potvrde: 1000000002

Imate novu poruku od gosta

Poruka gosta Marko Test:

Hello, you will bring me to the airport tomorrow at 7:30 AM. Just write
to you to double check. Best, Marko

Odgovori

Detalji rezervacije

Ime gosta:
Marko Test

Prijava:
ned, 19. lis. 2025.

Odjava:
pon, 20. lis. 2025.

Ime objekta:
Sample Apartment Zagreb

Broj rezervacije:
1000000002

Ukupan br. gostiju:
1

Ukupan br. jedinica:
1

© Copyright Booking.com 2025
Ovu je poruku e-pošte poslao Booking.com

Ova je poruka poslana na adresu partner@example.com
`,
}
