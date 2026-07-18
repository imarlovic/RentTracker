using RentTracker.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RentTracker.Core.Interfaces
{
    public interface IPushNotificationService
    {
        Task<PushNotificationSubscription> StoreSubscriptionAsync(PushNotificationSubscription subscription);
        Task UnsubscribeAsync(string endpoint);
        Task<IEnumerable<PushNotificationSubscription>> GetSubscriptions();
    }
}
