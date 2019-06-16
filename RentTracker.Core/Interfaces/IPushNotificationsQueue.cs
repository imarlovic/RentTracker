using RentTracker.Core.Models;
using System.Threading;
using System.Threading.Tasks;

namespace RentTracker.Core.Interfaces
{
    public interface IPushNotificationsQueue
    {
        void Enqueue(PushNotification message);

        Task<PushNotification> DequeueAsync(CancellationToken cancellationToken);
    }
}
