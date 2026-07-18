namespace RentTracker.Core.Specifications.IntegrationConfiguration
{
    public class ActiveIntegrationConfigurations : BaseSpecification<Entities.IntegrationConfiguration>
    {
        public ActiveIntegrationConfigurations() : base(ic => ic.Status == Entities.IntegrationStatus.Failed || ic.Status == Entities.IntegrationStatus.Working)
        {

        }
    }
}
