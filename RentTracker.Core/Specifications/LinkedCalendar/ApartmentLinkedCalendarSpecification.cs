using System;

namespace RentTracker.Core.Specifications.LinkedCalendar
{
    public class ApartmentLinkedCalendarSpecification : BaseLinkedCalendarSpecification
    {
        public ApartmentLinkedCalendarSpecification(Guid apartmentId)
        {
            DefaultCriteria = lc => lc.ApartmentId == apartmentId;
        }
    }
}
