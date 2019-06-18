using Ical.Net;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using PuppeteerSharp;
using RentTracker.Core.Entities;
using RentTracker.Core.Interfaces;
using RentTracker.Core.Models;
using RentTracker.Core.Specifications.IntegrationConfiguration;
using RentTracker.Core.Specifications.LinkedCalendar;
using RentTracker.Core.Specifications.Reservation;
using RentTracker.Data.Interfaces;
using RentTracker.Service.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Security.Authentication;
using System.Threading.Tasks;
using System.Web;

namespace RentTracker.Service
{
    public class ApartmentService : IApartmentService
    {
        readonly IUnitOfWork UnitOfWork;
        readonly IPushNotificationsQueue _pushNotificationsQueue;
        readonly HttpClient HttpClient;
        public ApartmentService(IUnitOfWork unitOfWork, IPushNotificationsQueue pushNotificationsQueue)
        {
            UnitOfWork = unitOfWork;
            _pushNotificationsQueue = pushNotificationsQueue;
            HttpClient = new HttpClient();
        }

        #region Apartment

        public async Task<Apartment> GetAsync(Guid id)
        {
            var apartment = await UnitOfWork.Repository<Apartment>().Get(id);

            return apartment;
        }
        public Task<IEnumerable<Apartment>> GetAsync(ISpecification<Apartment> specification) => UnitOfWork.Repository<Apartment>().FindBySpecification(specification);
        public async Task<Apartment> CreateAsync(Apartment entity)
        {
            await UnitOfWork.Repository<Apartment>().Add(entity);
            await UnitOfWork.SaveAsync();

            return entity;
        }
        public async Task<Apartment> UpdateAsync(Apartment entity)
        {
            var apartment = await UnitOfWork.Repository<Apartment>().Get(entity.Id);

            apartment.Name = entity.Name;

            await UnitOfWork.Repository<Apartment>().Update(apartment);
            await UnitOfWork.SaveAsync();

            return entity;
        }
        public async Task DeleteAsync(Guid id)
        {
            var entity = await UnitOfWork.Repository<Apartment>().Get(id);

            await UnitOfWork.Repository<Apartment>().Delete(entity);
            await UnitOfWork.SaveAsync();
        }

        #endregion

        #region Expense 

        public async Task<Expense> CreateExpenseAsync(Expense entity)
        {
            await UnitOfWork.Repository<Expense>().Add(entity);
            await UnitOfWork.SaveAsync();

            return entity;
        }
        public async Task<Expense> UpdateExpenseAsync(Expense entity)
        {
            var existingEntity = await UnitOfWork.Repository<Expense>().Get(entity.Id);

            existingEntity.Name = entity.Name;
            existingEntity.Description = entity.Description;
            existingEntity.Amount = entity.Amount;
            existingEntity.Currency = entity.Currency;
            existingEntity.Date = entity.Date;

            await UnitOfWork.Repository<Expense>().Update(existingEntity);
            await UnitOfWork.SaveAsync();

            return existingEntity;
        }
        public async Task DeleteExpenseAsync(Guid id)
        {
            var entity = await UnitOfWork.Repository<Expense>().Get(id);

            await UnitOfWork.Repository<Expense>().Delete(entity);
            await UnitOfWork.SaveAsync();
        }

        #endregion

        #region Document

        public async Task<Document> CreateDocumentAsync(Document entity)
        {
            entity.UploadTime = DateTime.Now;
            await UnitOfWork.Repository<Document>().Add(entity);
            await UnitOfWork.SaveAsync();

            return entity;
        }
        public async Task<Document> UpdateDocumentAsync(Document entity)
        {
            var existingEntity = await UnitOfWork.Repository<Document>().Get(entity.Id);

            existingEntity.Title = entity.Title;

            if(entity.Blob != null)
            {
                existingEntity.UploadTime = DateTime.Now;
                existingEntity.FileName = entity.FileName;
                existingEntity.FileExtension = entity.FileExtension;
                existingEntity.MimeType = entity.MimeType;
                existingEntity.Blob = entity.Blob;
            }

            await UnitOfWork.Repository<Document>().Update(existingEntity);
            await UnitOfWork.SaveAsync();

            existingEntity.Blob = null;

            return existingEntity;
        }
        public async Task DeleteDocumentAsync(Guid id)
        {
            var entity = await UnitOfWork.Repository<Document>().Get(id);

            await UnitOfWork.Repository<Document>().Delete(entity);
            await UnitOfWork.SaveAsync();
        }

        #endregion

        #region Reservation 

        public async Task<Reservation> CreateReservationAsync(Reservation entity)
        {
            var apartment = await GetAsync(entity.ApartmentId);

            await UnitOfWork.Repository<Reservation>().Add(entity);
            await UnitOfWork.SaveAsync();

            NotifyReservationCreated(apartment, entity);

            return entity;
        }
        public async Task<Reservation> UpdateReservationAsync(Reservation entity)
        {
            var existingEntity = await UnitOfWork.Repository<Reservation>().Get(entity.Id);

            existingEntity.State = entity.State;
            existingEntity.Reference = entity.Reference;
            existingEntity.Source = entity.Source;
            existingEntity.HoldingName = entity.HoldingName;

            existingEntity.Price = entity.Price;
            existingEntity.Commission = entity.Price;
            existingEntity.Currency = entity.Currency;

            existingEntity.StartDate = entity.StartDate;
            existingEntity.EndDate = entity.EndDate;

            existingEntity.People = entity.People;
            existingEntity.Adults = entity.Adults;
            existingEntity.Children = entity.Children;
            existingEntity.Infants = entity.Infants;

            await UnitOfWork.Repository<Reservation>().Update(existingEntity);
            await UnitOfWork.SaveAsync();

            return existingEntity;
        }
        public async Task DeleteReservationAsync(Guid id)
        {
            var entity = await UnitOfWork.Repository<Reservation>().Get(id);

            await UnitOfWork.Repository<Reservation>().Delete(entity);
            await UnitOfWork.SaveAsync();
        }

        #endregion

        #region Linked calendar

        public async Task<IEnumerable<LinkedCalendar>> GetLinkedCalendarsAsync(Guid apartmentId)
        {
            var specification = new ApartmentLinkedCalendarSpecification(apartmentId);
            var linkedCalendars = await UnitOfWork.Repository<LinkedCalendar>().FindBySpecification(specification);

            return linkedCalendars;
        }
        public async Task<LinkedCalendar> CreateLinkedCalendarAsync(LinkedCalendar entity)
        {
            await UnitOfWork.Repository<LinkedCalendar>().Add(entity);
            await UnitOfWork.SaveAsync();

            return entity;
        }
        public async Task<LinkedCalendar> UpdateLinkedCalendarAsync(LinkedCalendar entity)
        {
            var existingEntity = await UnitOfWork.Repository<LinkedCalendar>().Get(entity.Id);

            existingEntity.Name = entity.Name;
            existingEntity.Url = entity.Url;

            await UnitOfWork.Repository<LinkedCalendar>().Update(existingEntity);
            await UnitOfWork.SaveAsync();

            return existingEntity;
        }
        public async Task DeleteLinkedCalendarAsync(Guid id)
        {
            var entity = await UnitOfWork.Repository<LinkedCalendar>().Get(id);

            await UnitOfWork.Repository<LinkedCalendar>().Delete(entity);
            await UnitOfWork.SaveAsync();
        }

        public async Task SyncLinkedCalendarAsync(Guid apartmentId, Guid linkedCalendarId)
        {
            var apartment = await UnitOfWork.Repository<Apartment>().Get(apartmentId);
            var linkedCalendar = await UnitOfWork.Repository<LinkedCalendar>().Get(linkedCalendarId);
            var calendarData = await HttpClient.GetStringAsync(linkedCalendar.Url);

            var parser = new CalendarEventParser();

            var calendarReservations = parser.ParseReservations(calendarData).Where(x => x.StartDate >= DateTime.Now.Date).ToList();
            var calendarReservationExternalIdMap = calendarReservations.ToDictionary(r => r.ExternalId);
            var calendarReservationStartDateMap = calendarReservations.ToDictionary(r => r.StartDate.Date);
            var calendarReservationReferenceMap = calendarReservations.Where(r => r.Reference != null).ToDictionary(r => r.Reference);

            var specification = new CurrentReservations(apartmentId, parser.Source);
            var currentReservations = await UnitOfWork.Repository<Reservation>().FindBySpecification(specification);

            var matchedExternalReservationIds = new HashSet<string>();
            var createdReservations = new List<Reservation>();
            var cancelledReservations = new List<Reservation>();

            foreach (var existingReservation in currentReservations)
            {
                Reservation externalReservation = null;

                if (existingReservation.Reference != null)
                    calendarReservationReferenceMap.TryGetValue(existingReservation.Reference, out externalReservation);

                if (externalReservation == null && existingReservation.ExternalId != null)
                    calendarReservationExternalIdMap.TryGetValue(existingReservation.ExternalId, out externalReservation);

                if (externalReservation == null)
                    calendarReservationStartDateMap.TryGetValue(existingReservation.StartDate.Date, out externalReservation);

                if (externalReservation == null && existingReservation.State != ReservationState.Canceled) // CANCELLED
                {
                    existingReservation.State = ReservationState.Canceled;
                    await UnitOfWork.Repository<Reservation>().Update(existingReservation);

                    cancelledReservations.Add(existingReservation);
                }
                else if(externalReservation != null) // UPDATE
                {
                    existingReservation.StartDate = externalReservation.StartDate;
                    existingReservation.EndDate = externalReservation.EndDate;
                    existingReservation.HoldingName = existingReservation.HoldingName ?? externalReservation.HoldingName;
                    existingReservation.Reference = existingReservation.Reference ?? externalReservation.Reference;
                    existingReservation.ExternalId = existingReservation.ExternalId ?? externalReservation.ExternalId;

                    await UnitOfWork.Repository<Reservation>().Update(existingReservation);

                    matchedExternalReservationIds.Add(externalReservation.ExternalId);
                }
            }

            foreach (var reservation in calendarReservations)
            {
                if(!matchedExternalReservationIds.Contains(reservation.ExternalId)) // ADD
                {
                    reservation.ApartmentId = apartmentId;
                    await UnitOfWork.Repository<Reservation>().Add(reservation);
                    createdReservations.Add(reservation);
                }                
            }

            linkedCalendar.LastUpdated = DateTime.Now;
            await UnitOfWork.Repository<LinkedCalendar>().Update(linkedCalendar);

            await UnitOfWork.SaveAsync();

            createdReservations.ForEach(r => NotifyReservationCreated(apartment, r));
            cancelledReservations.ForEach(r => NotifyReservationCancelled(apartment, r));
        }

        private void NotifyReservationCreated(Apartment apartment, Reservation newReservation)
        {
            var pushNotification = new PushNotification(NotificationType.NewReservation)
            {
                ApartmentId = apartment.Id,
                Title = $"You have a new reservation for {newReservation.StartDate.ToString("dd.MM.yyyy.")}",
                Body = $"{apartment.Name}{Environment.NewLine}{newReservation.Source} - {newReservation.HoldingName} - {newReservation.StartDate.ToString("dd.MM.yyyy.")}"
            };

            _pushNotificationsQueue.Enqueue(pushNotification);
        }

        private void NotifyReservationCancelled(Apartment apartment, Reservation reservation)
        {
            var pushNotification = new PushNotification(NotificationType.Cancellation)
            {
                ApartmentId = apartment.Id,
                Title = $"Cancellation: {reservation.Source} {apartment.Name}",
                Body = $"{reservation.HoldingName} - {reservation.StartDate.ToString("dd.MM.yyyy.")}"
            };

            _pushNotificationsQueue.Enqueue(pushNotification);
        }

        #endregion

        #region Integration Configuration

        public async Task<IEnumerable<IntegrationConfiguration>> GetIntegrationConfigurationAsync(Guid apartmentId)
        {
            var specification = new IntegrationConfigurationByApartmentSpecification(apartmentId);
            var result = await UnitOfWork.Repository<IntegrationConfiguration>().FindBySpecification(specification);

            return result;
        }
        public async Task<IntegrationConfiguration> CreateIntegrationConfigurationAsync(IntegrationConfiguration entity)
        {
            await UnitOfWork.Repository<IntegrationConfiguration>().Add(entity);
            await UnitOfWork.SaveAsync();

            return entity;
        }
        public async Task<IntegrationConfiguration> UpdateIntegrationConfigurationAsync(IntegrationConfiguration entity)
        {
            var existingEntity = await UnitOfWork.Repository<IntegrationConfiguration>().Get(entity.Id);

            existingEntity.PropertyId = entity.PropertyId;
            existingEntity.Password = entity.Password;
            existingEntity.Status = entity.Status;
            existingEntity.LastUpdated = DateTime.Now;

            await UnitOfWork.Repository<IntegrationConfiguration>().Update(existingEntity);
            await UnitOfWork.SaveAsync();

            return existingEntity;
        }

        #endregion

        #region Booking.com integration

        public async Task<IntegrationConfiguration> GetBookingIntegrationConfigurationAsync(Guid apartmentId)
        {
            var specification = new IntegrationConfigurationByProviderSpecification(apartmentId, IntegrationProvider.Booking);
            var config = (await UnitOfWork.Repository<IntegrationConfiguration>().FindBySpecification(specification)).SingleOrDefault();

            return config;
        }
        public async Task<IntegrationConfiguration> SetUpBookingIntegrationAsync(Guid apartmentId, string pulseCode = null)
        {
            var specification = new IntegrationConfigurationByProviderSpecification(apartmentId, IntegrationProvider.Booking);
            var config = (await UnitOfWork.Repository<IntegrationConfiguration>().FindBySpecification(specification)).SingleOrDefault();

            try
            {
                config.StateJson = await BookingIntegrationHelper.GetStateJsonAsync(config, pulseCode);
                config.Status = IntegrationStatus.Working;
            }
            catch
            {
                config.Status = IntegrationStatus.Failed;

                throw;
            }
            finally
            {
                await UnitOfWork.Repository<IntegrationConfiguration>().Update(config);
                await UnitOfWork.SaveAsync();
            }

            return config;
        }
        public async Task<IntegrationConfiguration> SyncBookingReservations(Guid apartmentId, DateTime? start = null, DateTime? end = null)
        {
            var config = await GetBookingIntegrationConfigurationAsync(apartmentId);
            var apartment = await GetAsync(apartmentId);

            try
            {
                var specification = new ApartmentReservationsSpecification(apartmentId)
                {
                    StartDate = start.HasValue ? start.Value.Date : new DateTime(DateTime.Now.Year, 1, 1),
                    EndDate = end.HasValue ? end.Value.Date : DateTime.Now.AddMonths(6),
                    Source = Source.Booking
                };
                var currentReservations = (await UnitOfWork.Repository<Reservation>().FindBySpecification(specification)).ToArray();

                IEnumerable<Reservation> externalReservations;
                var createdReservations = new List<Reservation>();

                try
                {
                    externalReservations = await BookingIntegrationHelper.GetReservations(config, specification.StartDate, specification.EndDate);
                }
                catch(AuthenticationException)
                {
                    config = await SetUpBookingIntegrationAsync(apartmentId);
                    externalReservations = await BookingIntegrationHelper.GetReservations(config, specification.StartDate, specification.EndDate);
                }

                foreach (var reservation in externalReservations)
                {
                    var existingReservation = currentReservations.Where(r => r.Reference == reservation.Reference || r.StartDate == reservation.StartDate).FirstOrDefault();

                    if(existingReservation == null) // ADD
                    {
                        reservation.ApartmentId = apartmentId;
                        await UnitOfWork.Repository<Reservation>().Add(reservation);

                        createdReservations.Add(reservation);
                    }
                    else // UPDATE
                    {
                        existingReservation.HoldingName = reservation.HoldingName;
                        existingReservation.Reference = reservation.Reference;
                        existingReservation.Source = reservation.Source;
                        existingReservation.Currency = reservation.Currency;
                        existingReservation.Price = reservation.Price;
                        existingReservation.Commission = reservation.Commission;
                        existingReservation.StartDate = reservation.StartDate;
                        existingReservation.EndDate = reservation.EndDate;
                        existingReservation.BookingDate = reservation.BookingDate;
                        existingReservation.People = reservation.People;
                        existingReservation.Adults = reservation.Adults;
                        existingReservation.Children = reservation.Children;
                        existingReservation.State = reservation.State;

                        await UnitOfWork.Repository<Reservation>().Update(existingReservation);
                    }
                }

                config.Status = IntegrationStatus.Working;
                config.LastUpdated = DateTime.Now;
                await UnitOfWork.SaveAsync();

                createdReservations.ForEach(r => NotifyReservationCreated(apartment, r));
            }
            catch
            {
                config.Status = IntegrationStatus.Failed;

                throw;
            }
            finally
            {
                await UnitOfWork.Repository<IntegrationConfiguration>().Update(config);
                await UnitOfWork.SaveAsync();
            }

            return config;
        }

        #endregion

        #region Airbnb integration

        public async Task<IntegrationConfiguration> GetAirbnbIntegrationConfigurationAsync(Guid apartmentId)
        {
            var specification = new IntegrationConfigurationByProviderSpecification(apartmentId, IntegrationProvider.Airbnb);
            var config = (await UnitOfWork.Repository<IntegrationConfiguration>().FindBySpecification(specification)).SingleOrDefault();

            return config;
        }
        public async Task<IntegrationConfiguration> SetUpAirbnbIntegrationAsync(Guid apartmentId)
        {
            var specification = new IntegrationConfigurationByProviderSpecification(apartmentId, IntegrationProvider.Airbnb);
            var config = (await UnitOfWork.Repository<IntegrationConfiguration>().FindBySpecification(specification)).SingleOrDefault();

            try
            {
                config.StateJson = await AirbnbIntegrationHelper.GetStateJsonAsync(config);
                config.Status = IntegrationStatus.Working;
            }
            catch
            {
                config.Status = IntegrationStatus.Failed;
                throw;
            }
            finally
            {
                await UnitOfWork.Repository<IntegrationConfiguration>().Update(config);
                await UnitOfWork.SaveAsync();
            }

            return config;
        }
        public async Task<IntegrationConfiguration> SyncAirbnbReservations(Guid apartmentId, DateTime? start = null, DateTime? end = null)
        {
            var config = await GetAirbnbIntegrationConfigurationAsync(apartmentId);
            var apartment = await GetAsync(apartmentId);

            try
            {
                var specification = new ApartmentReservationsSpecification(apartmentId)
                {
                    StartDate = start.HasValue ? start.Value.Date : new DateTime(DateTime.Now.Year, 1, 1),
                    EndDate = end.HasValue ? end.Value.Date : DateTime.Now.AddMonths(6),
                    Source = Source.Airbnb
                };

                var currentReservations = (await UnitOfWork.Repository<Reservation>().FindBySpecification(specification)).ToArray();

                IEnumerable<Reservation> externalReservations;
                var createdReservations = new List<Reservation>();

                try
                {
                    externalReservations = await AirbnbIntegrationHelper.GetReservations(config, specification.StartDate, specification.EndDate);
                }
                catch (AuthenticationException)
                {
                    config = await SetUpAirbnbIntegrationAsync(apartmentId);
                    externalReservations = await AirbnbIntegrationHelper.GetReservations(config, specification.StartDate, specification.EndDate);
                }

                foreach (var reservation in externalReservations)
                {
                    var existingReservation = currentReservations.Where(r => r.Reference == reservation.Reference || r.StartDate.Date == reservation.StartDate.Date).FirstOrDefault();

                    if (existingReservation == null) // ADD
                    {
                        reservation.ApartmentId = apartmentId;
                        await UnitOfWork.Repository<Reservation>().Add(reservation);
                    }
                    else // UPDATE
                    {
                        existingReservation.HoldingName = reservation.HoldingName;
                        existingReservation.Reference = reservation.Reference;
                        existingReservation.Source = reservation.Source;
                        existingReservation.Currency = reservation.Currency;
                        existingReservation.Price = reservation.Price;
                        existingReservation.Commission = reservation.Commission;
                        existingReservation.StartDate = reservation.StartDate;
                        existingReservation.EndDate = reservation.EndDate;
                        existingReservation.BookingDate = reservation.BookingDate;
                        existingReservation.People = reservation.People;
                        existingReservation.Adults = reservation.Adults;
                        existingReservation.Children = reservation.Children;
                        existingReservation.Infants = reservation.Infants;
                        existingReservation.State = reservation.State;

                        await UnitOfWork.Repository<Reservation>().Update(existingReservation);
                    }
                }

                config.Status = IntegrationStatus.Working;
                config.LastUpdated = DateTime.Now;

                await UnitOfWork.SaveAsync();

                createdReservations.ForEach(r => NotifyReservationCreated(apartment, r));
            }
            catch
            {
                config.Status = IntegrationStatus.Failed;
                throw;
            }
            finally
            {
                await UnitOfWork.Repository<IntegrationConfiguration>().Update(config);
                await UnitOfWork.SaveAsync();
            }

            return config;
        }

        #endregion
    }
}
