using Ical.Net;
using RentTracker.Core.Entities;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;

namespace RentTracker.Service.Utilities
{
    public class CalendarEventParser
    {
        public Calendar Calendar;
        public string ExternalIdSufix;
        public Source Source;

        public ICollection<Reservation> ParseReservations(string calendarData)
        {
            var reservations = new List<Reservation>();
            Calendar = Calendar.Load(calendarData);

            var exampleUid = Calendar.Events.FirstOrDefault()?.Uid;

            if (exampleUid != null)
            {
                ExternalIdSufix = "@" + exampleUid.Split('@')[1];
                if (exampleUid.EndsWith("@airbnb.com"))
                {
                    Source = Source.Airbnb;
                }
                else if (exampleUid.EndsWith("@booking.com"))
                {
                    Source = Source.Booking;
                }
                else
                {
                    Source = Source.Other;
                }
            }
            else
            {
                ExternalIdSufix = null;
                Source = Source.Other;
            }

            foreach (var vEvent in Calendar.Events)
            {
                var reservation = new Reservation
                {
                    StartDate = vEvent.Start.AsSystemLocal,
                    EndDate = vEvent.End.AsSystemLocal,
                    ExternalId = vEvent.Uid,
                    Source = Source.Other,
                    State = ReservationState.Active
                };

                if(vEvent.Uid.EndsWith("@airbnb.com"))
                {
                    if (vEvent.Summary.Contains("Not available")) continue;

                    reservation.Source = Source.Airbnb;

                    //Matt Guenther (HMRH453TCX)
                    var nameRegex = new Regex(@"^(.+) \((\w+)\)$");
                    var match = nameRegex.Match(vEvent.Summary);

                    if(match.Success)
                    {
                        reservation.HoldingName = match.Groups[1].Value;
                        reservation.Reference = match.Groups[2].Value;
                    }

                    // CHECKIN: 05/28/2018\nCHECKOUT: 05/30/2018\nNIGHTS: 2\nPHONE: +1(204) 299 - 5859\nEMAIL: (no email alias available)\nPROPERTY: Apartment Luna near Zagreb Airport\n
                }

                if (vEvent.Uid.EndsWith("@booking.com"))
                {
                    reservation.Source = Source.Booking;

                    var nameRegex = new Regex(@"CLOSED\s+-\s+(\w+)");
                    var match = nameRegex.Match(vEvent.Summary);

                    if(match.Success)
                    {
                        reservation.HoldingName = match.Groups[1].Value;
                    }
                }

                reservations.Add(reservation);
            }

            return reservations;
        }
    }
}
