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
    public class CalendarSyncService : IHostedService
    {
        private readonly ILogger _logger;
        private readonly IServiceProvider _serviceProvider;

        private CrontabSchedule _schedule;
        protected const string _cronExpression = "5,20,35,50 * * * *";
        private Task _calendarSyncTask;
        private CancellationTokenSource cancellationTokenSource;

        public CalendarSyncService(IServiceProvider serviceProvider, ILogger<CalendarSyncService> logger)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
            _schedule = CrontabSchedule.Parse(_cronExpression);
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            cancellationTokenSource = new CancellationTokenSource();

            _calendarSyncTask = RunCalendarSync(cancellationTokenSource.Token);

            return Task.CompletedTask;
        }
        private async Task RunCalendarSync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Calendar Sync Service is working...");

            var now = DateTime.Now;
            var _nextRun = _schedule.GetNextOccurrence(now);

            do
            {
                if (now > _nextRun)
                {
                    _logger.LogInformation("Calendar sync in progress .");

                    using (var scope = _serviceProvider.CreateScope())
                    {
                        ILinkedCalendarService _linkedCalendarService = scope.ServiceProvider.GetRequiredService<ILinkedCalendarService>();

                        var specification = new Core.Specifications.LinkedCalendar.BaseLinkedCalendarSpecification();
                        var calendars = await _linkedCalendarService.GetAsync(specification);

                        var calendarSyncTasks = calendars.Select(calendar => SyncCalendar(calendar)).ToArray();

                        Task.WaitAll(calendarSyncTasks, cancellationToken);
                    }

                    _nextRun = _schedule.GetNextOccurrence(DateTime.Now);

                    _logger.LogInformation($"Calendar sync in finished. Next run: {_nextRun}");
                }

                await Task.Delay(30000, cancellationToken); //30 second delay

                now = DateTime.Now;
            }
            while (!cancellationToken.IsCancellationRequested);

            _logger.LogInformation("Calendar sync task cancelled.");
        }

        private async Task SyncCalendar(LinkedCalendar calendar)
        {
            using (var scope = _serviceProvider.CreateScope())
            {
                IApartmentService _apartmentService = scope.ServiceProvider.GetRequiredService<IApartmentService>();
                await _apartmentService.SyncLinkedCalendarAsync(calendar.ApartmentId, calendar.Id);
            }
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Calendar Sync Service is stopping.");

            cancellationTokenSource.Cancel();

            return Task.WhenAny(_calendarSyncTask);
        }
    }
}
