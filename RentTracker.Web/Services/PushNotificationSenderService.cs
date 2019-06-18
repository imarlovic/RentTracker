using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using RentTracker.Core.Interfaces;
using RentTracker.Core.Models;
using System;
using System.Collections.Concurrent;
using System.Threading;
using System.Threading.Tasks;
using WebPush;

namespace RentTracker.Web.Services
{
    public class PushNotificationSenderService : IHostedService
    {
        private readonly ILogger _logger;
        private readonly IServiceProvider _serviceProvider;
        private readonly IPushNotificationsQueue _pushNotificationQueue;
        private CancellationTokenSource cancellationTokenSource;
        private Task _sendNotificationsTask;

        public PushNotificationSenderService(IServiceProvider serviceProvider, ILogger<PushNotificationSenderService> logger, IPushNotificationsQueue pushNotificationsQueue)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
            _pushNotificationQueue = pushNotificationsQueue;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            cancellationTokenSource = new CancellationTokenSource();

            _sendNotificationsTask = SendNotificationsAsync(cancellationTokenSource.Token);

            return Task.CompletedTask;
        }

        private async Task SendNotificationsAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Push Notification Service is working...");

            while (!cancellationToken.IsCancellationRequested)
            {
                var pushMessage = await _pushNotificationQueue.DequeueAsync(cancellationToken);

                if (!cancellationToken.IsCancellationRequested)
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var vapidDetails = scope.ServiceProvider.GetRequiredService<VapidDetails>();
                        var pushNotificationService = scope.ServiceProvider.GetRequiredService<IPushNotificationService>();

                        var subscriptions = await pushNotificationService.GetSubscriptions();

                        var pushClient = new WebPushClient();

                        foreach (var subscription in subscriptions)
                        {
                            var pushSubscription = new PushSubscription(subscription.Endpoint, subscription.P256DH, subscription.Auth);

                            try
                            {
                                var payload = JsonConvert.SerializeObject(new
                                {
                                    title = pushMessage.Title,
                                    body = pushMessage.Body
                                });

                                await pushClient.SendNotificationAsync(pushSubscription, payload, vapidDetails);

                                Console.WriteLine($"Notification successfully sent: {pushSubscription.Endpoint}");
                            }
                            catch (WebPushException e)
                            {
                                if(e.StatusCode == System.Net.HttpStatusCode.Gone)
                                {

                                    await pushNotificationService.UnsubscribeAsync(e.PushSubscription.Endpoint);
                                }
                                else
                                {
                                    _logger.LogError(e, $"Notification failed | Endpoint: {pushSubscription.Endpoint} | UserId: {subscription.UserId}");
                                }
                            }
                        }
                    }
                }
            }

        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Push Notification Service is stopping.");

            cancellationTokenSource.Cancel();

            return Task.WhenAny(_sendNotificationsTask);
        }
    }

    internal class PushNotificationsQueue : IPushNotificationsQueue
    {
        private readonly ConcurrentQueue<PushNotification> _messages = new ConcurrentQueue<PushNotification>();
        private readonly SemaphoreSlim _messageEnqueuedSignal = new SemaphoreSlim(0);

        public void Enqueue(PushNotification message)
        {
            if (message == null)
            {
                throw new ArgumentNullException(nameof(message));
            }

            _messages.Enqueue(message);

            _messageEnqueuedSignal.Release();
        }

        public async Task<PushNotification> DequeueAsync(CancellationToken cancellationToken)
        {
            await _messageEnqueuedSignal.WaitAsync(cancellationToken);

            if(!cancellationToken.IsCancellationRequested)
            {
                _messages.TryDequeue(out PushNotification message);

                return message;
            }
            else
            {
                return null;
            }
        }
    }
}
