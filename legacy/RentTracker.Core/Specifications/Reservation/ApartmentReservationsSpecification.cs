using RentTracker.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;

namespace RentTracker.Core.Specifications.Reservation
{
    public class ApartmentReservationsSpecification : BaseReservationSpecification
    {
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public Source? Source { get; set; }
        public ReservationState? State { get; set; }
        public ApartmentReservationsSpecification(Guid apartmentId) : base()
        {
            DefaultCriteria = r => r.Apartment.Id == apartmentId;
        }

        public override ICollection<Expression<Func<Entities.Reservation, bool>>> Criterias
        {
            get
            {
                var criterias = new List<Expression<Func<Entities.Reservation, bool>>> { DefaultCriteria };

                if (StartDate.HasValue) criterias.Add(e => e.StartDate.Date >= StartDate.Value.Date);
                if (EndDate.HasValue) criterias.Add(e => e.EndDate.Date <= EndDate.Value.Date);
                if (Source.HasValue) criterias.Add(r => r.Source == Source.Value);
                if(State.HasValue) criterias.Add(r => r.State == State.Value);

                return criterias;
            }
        }
    }
}
