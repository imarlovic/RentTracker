using System;

namespace RentTracker.Core.Specifications.Apartment
{
    public class OwnedApartmentsSpecification : BaseApartmentSpecification
    {
        public OwnedApartmentsSpecification(Guid ownerId) : base()
        {
            DefaultCriteria = a => a.OwnerId == ownerId;
        }
    }
}
