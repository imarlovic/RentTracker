using RentTracker.Core.Entities;
using RentTracker.Core.Interfaces;
using RentTracker.Data.Interfaces;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebPush;

namespace RentTracker.Service
{
    public class PushNotificationService : IPushNotificationService
    {
        readonly IUnitOfWork _unitOfWork;
        readonly VapidDetails _vapidDetails;
        public PushNotificationService(VapidDetails vapidDetails, IUnitOfWork unitOfWork)
        {
            _vapidDetails = vapidDetails;
            _unitOfWork = unitOfWork;
        }
        public Task<IEnumerable<PushNotificationSubscription>> GetSubscriptions() => _unitOfWork.Repository<PushNotificationSubscription>().Get();

        public async Task<PushNotificationSubscription> StoreSubscriptionAsync(PushNotificationSubscription subscription)
        {
            var specification = new Core.Specifications.PushNotificationSubscription.PushNotificationSubscriptionByEndpoint(subscription.Endpoint);
            var existingSubscription = (await _unitOfWork.Repository<PushNotificationSubscription>().FindBySpecification(specification)).SingleOrDefault();

            if(existingSubscription == null)
            {
                await _unitOfWork.Repository<PushNotificationSubscription>().Add(subscription);
            }
            else
            {
                existingSubscription.Auth = subscription.Auth;
                existingSubscription.P256DH = subscription.P256DH;

                await _unitOfWork.Repository<PushNotificationSubscription>().Update(existingSubscription);
            }

            await _unitOfWork.SaveAsync();

            return subscription;
        }

        public async Task UnsubscribeAsync(string endpoint)
        {
            var specification = new Core.Specifications.PushNotificationSubscription.PushNotificationSubscriptionByEndpoint(endpoint);
            var subscription = (await _unitOfWork.Repository<PushNotificationSubscription>().FindBySpecification(specification)).SingleOrDefault();

            if(subscription != null)
            {
                await _unitOfWork.Repository<PushNotificationSubscription>().Delete(subscription);
                await _unitOfWork.SaveAsync();
            }
        }
    }
}
