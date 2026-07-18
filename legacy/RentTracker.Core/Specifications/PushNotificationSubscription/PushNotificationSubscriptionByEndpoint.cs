namespace RentTracker.Core.Specifications.PushNotificationSubscription
{
    public class PushNotificationSubscriptionByEndpoint : BaseSpecification<Entities.PushNotificationSubscription>
    {
        public PushNotificationSubscriptionByEndpoint(string endpoint) : base(pns => pns.Endpoint == endpoint)
        {

        }
    }
}
