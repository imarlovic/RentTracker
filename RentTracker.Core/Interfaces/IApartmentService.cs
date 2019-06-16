using RentTracker.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RentTracker.Core.Interfaces
{
    public interface IApartmentService : IService<Apartment>
    {
        #region Expense

        Task<Expense> CreateExpenseAsync(Expense entity);
        Task<Expense> UpdateExpenseAsync(Expense entity);
        Task DeleteExpenseAsync(Guid id);

        #endregion

        #region Document

        Task<Document> CreateDocumentAsync(Document entity);
        Task<Document> UpdateDocumentAsync(Document entity);
        Task DeleteDocumentAsync(Guid id);

        #endregion

        #region Reservations

        Task<Reservation> CreateReservationAsync(Reservation entity);
        Task<Reservation> UpdateReservationAsync(Reservation entity);
        Task DeleteReservationAsync(Guid id);

        #endregion

        #region Linked Calendar

        Task<IEnumerable<LinkedCalendar>> GetLinkedCalendarsAsync(Guid id);
        Task<LinkedCalendar> CreateLinkedCalendarAsync(LinkedCalendar entity);
        Task<LinkedCalendar> UpdateLinkedCalendarAsync(LinkedCalendar entity);
        Task DeleteLinkedCalendarAsync(Guid id);

        Task SyncLinkedCalendarAsync(Guid apartmentId, Guid linkedCalendarId);

        #endregion

        #region Integration Configuration

        Task<IEnumerable<IntegrationConfiguration>> GetIntegrationConfigurationAsync(Guid apartmentId);
        Task<IntegrationConfiguration> CreateIntegrationConfigurationAsync(IntegrationConfiguration entity);
        Task<IntegrationConfiguration> UpdateIntegrationConfigurationAsync(IntegrationConfiguration entity);

        #endregion

        #region Booking.com integration
        Task<IntegrationConfiguration> GetBookingIntegrationConfigurationAsync(Guid apartmentId);
        Task<IntegrationConfiguration> SetUpBookingIntegrationAsync(Guid apartmentId, string pulseCode);
        Task<IntegrationConfiguration> SyncBookingReservations(Guid apartmentId);
        #endregion

        #region Airbnb integration
        Task<IntegrationConfiguration> GetAirbnbIntegrationConfigurationAsync(Guid apartmentId);
        Task<IntegrationConfiguration> SetUpAirbnbIntegrationAsync(Guid apartmentId);
        Task<IntegrationConfiguration> SyncAirbnbReservations(Guid apartmentId);
        #endregion
    }
}
