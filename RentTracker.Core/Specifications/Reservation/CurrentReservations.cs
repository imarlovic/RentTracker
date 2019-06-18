using RentTracker.Core.Entities;
using System;

namespace RentTracker.Core.Specifications.Reservation
{
    public class CurrentReservations : BaseReservationSpecification
    {
        public CurrentReservations(Guid apartmentId, Source source) : base()
        {
            DefaultCriteria = r => r.ApartmentId == apartmentId && r.Source == source &&
                r.StartDate.Date >= DateTime.Now.Date;
        }
    }
}
