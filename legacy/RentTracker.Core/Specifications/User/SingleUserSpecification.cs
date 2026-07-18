namespace RentTracker.Core.Specifications.User
{
    public class SingleUserSpecification : BaseSpecification<Entities.User>
    {
        public SingleUserSpecification(string username)
        {
            DefaultCriteria = u => u.UserName == username;

            AddInclude(u => u.Claims);
        }

        public SingleUserSpecification(string externalProvider, string externalId)
        {
            DefaultCriteria = u => u.ExternalProvider == externalProvider && u.ExternalId == externalId;

            AddInclude(u => u.Claims);
        }
    }
}
