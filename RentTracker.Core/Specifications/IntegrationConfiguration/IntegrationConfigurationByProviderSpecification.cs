using RentTracker.Core.Entities;
using System;

namespace RentTracker.Core.Specifications.IntegrationConfiguration
{
    public class IntegrationConfigurationByProviderSpecification : BaseSpecification<Entities.IntegrationConfiguration>
    {
        public IntegrationConfigurationByProviderSpecification(Guid apartmentId, IntegrationProvider provider)
        {
            DefaultCriteria = i => i.ApartmentId == apartmentId && i.Provider == provider;
        }
    }
}
