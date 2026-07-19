/**
 * Booking host-email fixtures for parser / apply hardening.
 * These mimic common Booking.com partner notification shapes (not HTML-faithful).
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
