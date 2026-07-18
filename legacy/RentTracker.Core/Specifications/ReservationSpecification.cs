using RentTracker.Core.Entities;
using System;

namespace RentTracker.Core.Specifications
{
    public class ReservationSpecification : BaseSpecification<Entities.Reservation>
    {
        public ReservationSpecification(Guid reservationId)
            : base(r => r.Id == reservationId)
        {
            //AddInclude(b => b.Items);
        }
        public ReservationSpecification(Entities.Apartment apartment)
            : base(r => r.Apartment.Id == apartment.Id)
        {
            //AddInclude(b => b.Items);
        }
    }
}
