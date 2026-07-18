using System;

namespace RentTracker.Core.Specifications.IntegrationConfiguration
{
    public class IntegrationConfigurationByApartmentSpecification : BaseSpecification<Entities.IntegrationConfiguration>
    {
        public IntegrationConfigurationByApartmentSpecification(Guid apartmentId)
        {
            DefaultCriteria = i => i.ApartmentId == apartmentId;
        }
    }
}
