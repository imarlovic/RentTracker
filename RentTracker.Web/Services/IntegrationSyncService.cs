using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using NCrontab;
using RentTracker.Core.Entities;
using RentTracker.Core.Interfaces;

namespace RentTracker.Web.Services
{
    public class IntegrationSyncService : IHostedService
    {
        private readonly ILogger _logger;
        private readonly IServiceProvider _serviceProvider;

        private CrontabSchedule _schedule;
        private DateTime _nextRun;
        protected const string _cronExpression = "* 6,18 * * *";
        private Task _integrationSyncTask;


        public IntegrationSyncService(IServiceProvider serviceProvider, ILogger<IntegrationSyncService> logger)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
            _schedule = CrontabSchedule.Parse(_cronExpression);
            _nextRun = _schedule.GetNextOccurrence(DateTime.Now);
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Integration Sync Service is starting.");

            _integrationSyncTask = RunIntegrationSync(cancellationToken);

            return Task.CompletedTask;
        }

        private async Task RunIntegrationSync(CancellationToken cancellationToken)
        {
            do
            {
                var now = DateTime.Now;
                var _nextRun = _schedule.GetNextOccurrence(now);
                if (now > _nextRun)
                {
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        _logger.LogInformation("Integration Sync in progress .");

                        IIntegrationConfigurationService _integrationConfigurationService = scope.ServiceProvider.GetRequiredService<IIntegrationConfigurationService>();

                        var specification = new Core.Specifications.IntegrationConfiguration.ActiveIntegrationConfigurations();
                        var activeIntegrationConfigurations = await _integrationConfigurationService.GetAsync(specification);

                        var syncTasks = activeIntegrationConfigurations.Select(config => SyncIntegration(config)).ToArray();

                        Task.WaitAll(syncTasks, cancellationToken);
                    }

                    _nextRun = _schedule.GetNextOccurrence(DateTime.Now);
                }
                await Task.Delay(60000, cancellationToken); //1 minute delay
            }
            while (!cancellationToken.IsCancellationRequested);
        }

        private async Task SyncIntegration(IntegrationConfiguration config)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                IApartmentService _apartmentService = scope.ServiceProvider.GetRequiredService<IApartmentService>();

                switch(config.Provider)
                {
                    case IntegrationProvider.Airbnb:
                        await _apartmentService.SyncAirbnbReservations(config.ApartmentId);
                        break;
                    case IntegrationProvider.Booking:
                        await _apartmentService.SyncBookingReservations(config.ApartmentId);
                        break;
                }
            }
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Integration Sync Service is stopping.");

            return Task.CompletedTask;
        }
    }
}
