using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentTracker.Core.Entities;
using RentTracker.Core.Interfaces;
using RentTracker.Core.Specifications.Apartment;
using RentTracker.Core.Specifications.Document;
using RentTracker.Core.Specifications.Expense;
using RentTracker.Core.Specifications.Reservation;
using RentTracker.Data.Interfaces;
using RentTracker.Web.Models;

namespace RentTracker.Web.Controllers
{
    [Authorize]
    [Route("api/apartments")]
    [ApiController]
    public class ApartmentsController : ControllerBase
    {
        private readonly IUnitOfWork UnitOfWork;
        private readonly IApartmentService ApartmentService;
        public ApartmentsController(IUnitOfWork unitOfWork, IApartmentService apartmentService)
        {
            UnitOfWork = unitOfWork;
            ApartmentService = apartmentService;
        }

        #region Apartments

        // GET api/apartments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Apartment>>> Get()
        {
            var sub = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;
            var ownerId = Guid.Parse(sub);

            var specification = new OwnedApartmentsSpecification(ownerId);

            var apartments = await ApartmentService.GetAsync(specification);

            return Ok(apartments);
        }

        // POST api/apartments
        [HttpPost]
        public async Task<ActionResult<Apartment>> CreateApartmentAsync([FromBody] Apartment entity)
        {
            var sub = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;
            var ownerId = Guid.Parse(sub);

            entity.OwnerId = ownerId;

            var createdApartment = await ApartmentService.CreateAsync(entity);
            var resourceUri = $"{Request.Path}/{createdApartment.Id}";
            return Created(resourceUri, createdApartment);
        }

        // PUT api/apartments/{apartmentId}
        [HttpPut("{apartmentId}")]
        public async Task<ActionResult<Apartment>> UpdateApartmentAsync([FromBody] Apartment entity)
        {
            var apartment = await ApartmentService.GetAsync(entity.Id);
            apartment.Name = entity.Name;
            apartment.HeaderId = entity.HeaderId;

            apartment = await ApartmentService.UpdateAsync(apartment);

            return Ok(apartment);
        }

        #endregion

        #region Reservation

        // GET api/apartments/{apartmentId}/reservations
        [HttpGet("{apartmentId}/reservations")]
        public async Task<ActionResult<IEnumerable<Reservation>>> GetReservations(Guid apartmentId)
        {
            var specification = new ApartmentReservationsSpecification(apartmentId);
            var reservations = await UnitOfWork.Repository<Reservation>().FindBySpecification(specification);

            reservations = reservations.OrderBy(x => x.StartDate);

            return Ok(reservations);
        }

        // POST api/apartments/{apartmentId}/reservations
        [HttpPost("{apartmentId}/reservations")]
        public async Task<ActionResult<Reservation>> CreateReservationAsync(Guid apartmentId, [FromBody] Reservation entity)
        {
            entity.ApartmentId = apartmentId;
            var created = await ApartmentService.CreateReservationAsync(entity);

            var resourceUri = $"{Request.Path}/{created.Id}";

            return Created(resourceUri, created);
        }

        // PUT api/apartments/{apartmentId}/reservations/{expenseId}
        [HttpPut("{apartmentId}/reservations/{id}")]
        public async Task<ActionResult<Reservation>> UpdateReservationAsync(Guid apartmentId, Guid id, [FromBody] Reservation entity)
        {
            if (id != entity.Id) return BadRequest();

            entity.ApartmentId = apartmentId;
            var updatedEntity = await ApartmentService.UpdateReservationAsync(entity);

            return Ok(updatedEntity);
        }

        // DELETE api/apartments/{apartmentId}/reservations/{expenseId}
        [HttpDelete("{apartmentId}/reservations/{id}")]
        public async Task<ActionResult> DeleteReservationAsync(Guid id)
        {
            await ApartmentService.DeleteReservationAsync(id);

            return Ok();
        }

        #endregion

        #region Expense

        // GET api/apartments/{apartmentId}/expenses
        [HttpGet("{apartmentId}/expenses")]
        public async Task<ActionResult<IEnumerable<Expense>>> GetExpenses(Guid apartmentId, [FromQuery] int? year = null, [FromQuery] int? month = null)
        {
            var specification = new ExpensesByApartmentSpecification(apartmentId, year, month);

            var expenses = await UnitOfWork.Repository<Expense>().FindBySpecification(specification);

            return Ok(expenses);
        }

        // POST api/apartments/{apartmentId}/expenses
        [HttpPost("{apartmentId}/expenses")]
        public async Task<ActionResult<Expense>> CreateExpenseAsync(Guid apartmentId, [FromBody] Expense entity)
        {
            entity.ApartmentId = apartmentId;
            var createdCalendar = await ApartmentService.CreateExpenseAsync(entity);

            var resourceUri = $"{Request.Path}/{createdCalendar.Id}";

            return Created(resourceUri, createdCalendar);
        }

        // PUT api/apartments/{apartmentId}/expenses/{expenseId}
        [HttpPut("{apartmentId}/expenses/{id}")]
        public async Task<ActionResult<Expense>> UpdateExpenseAsync(Guid apartmentId, Guid id, [FromBody] Expense entity)
        {
            if (id != entity.Id) return BadRequest();

            entity.ApartmentId = apartmentId;
            var updatedEntity = await ApartmentService.UpdateExpenseAsync(entity);

            return Ok(updatedEntity);
        }

        // DELETE api/apartments/{apartmentId}/expenses/{expenseId}
        [HttpDelete("{apartmentId}/expenses/{id}")]
        public async Task<ActionResult> DeleteExpenseAsync(Guid id)
        {
            await ApartmentService.DeleteExpenseAsync(id);

            return Ok();
        }

        #endregion

        #region Document

        // GET api/apartments/{apartmentId}/documents
        [HttpGet("{apartmentId}/documents")]
        public async Task<ActionResult<IEnumerable<Document>>> GetDocuments(Guid apartmentId)
        {
            var specification = new DocumentByApartment(apartmentId);

            var expenses = await UnitOfWork.Repository<Document>().FindBySpecification(specification);

            return Ok(expenses);
        }

        // POST api/apartments/{apartmentId}/documents
        [HttpPost("{apartmentId}/documents")]
        public async Task<ActionResult<Expense>> CreateDocumentAsync(Guid apartmentId, [FromForm] DocumentModel model)
        {
            var entity = new Document
            {
                ApartmentId = apartmentId,
                Title = model.Title,
                FileName = Path.GetFileNameWithoutExtension(model.File.FileName),
                FileExtension = Path.GetExtension(model.File.FileName),
                MimeType = model.File.ContentType
            };

            var ms = new MemoryStream();
            await model.File.CopyToAsync(ms);

            entity.Blob = ms.ToArray();

            var created = await ApartmentService.CreateDocumentAsync(entity);
            var resourceUri = $"{Request.Path}/{created.Id}";

            return Created(resourceUri, created);
        }

        // PUT api/apartments/{apartmentId}/documents/{documentId}
        [HttpPut("{apartmentId}/documents/{id}")]
        public async Task<ActionResult<Document>> UpdateDocumentAsync(Guid apartmentId, Guid id, [FromForm] DocumentModel model)
        {
            var entity = new Document
            {
                Id = id,
                ApartmentId = apartmentId,
                Title = model.Title
            };

            if(model.File != null)
            {
                entity.FileName = Path.GetFileNameWithoutExtension(model.File.FileName);
                entity.FileExtension = Path.GetExtension(model.File.FileName);
                entity.MimeType = model.File.ContentType;

                var ms = new MemoryStream();
                await model.File.CopyToAsync(ms);
                entity.Blob = ms.ToArray();
            }

            var updatedEntity = await ApartmentService.UpdateDocumentAsync(entity);

            return Ok(updatedEntity);
        }

        // DELETE api/apartments/{apartmentId}/documents/{documentId}
        [HttpDelete("{apartmentId}/documents/{id}")]
        public async Task<ActionResult> DeleteDocumentAsync(Guid id)
        {
            await ApartmentService.DeleteDocumentAsync(id);

            return Ok();
        }

        #endregion

        #region Linked Calendar

        // GET api/apartments/{apartmentId}/linked-calendars
        [HttpGet("{apartmentId}/linked-calendars")]
        public async Task<ActionResult<IEnumerable<LinkedCalendar>>> GetLinkedCalendars(Guid apartmentId)
        {
            var linkedCalendars = await ApartmentService.GetLinkedCalendarsAsync(apartmentId);

            return Ok(linkedCalendars);
        }

        // POST api/apartments/{apartmentId}/linked-calendars
        [HttpPost("{apartmentId}/linked-calendars")]
        public async Task<ActionResult<LinkedCalendar>> CreateLinkedCalendarAsync(Guid apartmentId, [FromBody] LinkedCalendar entity)
        {
            entity.ApartmentId = apartmentId;
            var createdCalendar = await ApartmentService.CreateLinkedCalendarAsync(entity);

            var resourceUri = $"{Request.Path}/{createdCalendar.Id}";

            return Created(resourceUri, createdCalendar);
        }

        // PUT api/apartments/{apartmentId}/linked-calendars/{linkedCalendarId}
        [HttpPut("{apartmentId}/linked-calendars/{id}")]
        public async Task<ActionResult<LinkedCalendar>> UpdateLinkedCalendarAsync(Guid apartmentId, Guid id, [FromBody] LinkedCalendar entity)
        {
            if (id != entity.Id) return BadRequest();

            entity.ApartmentId = apartmentId;
            var updatedEntity = await ApartmentService.UpdateLinkedCalendarAsync(entity);

            return Ok(updatedEntity);
        }

        // DELETE api/apartments/{apartmentId}/linked-calendars/{linkedCalendarId}
        [HttpDelete("{apartmentId}/linked-calendars/{id}")]
        public async Task<ActionResult> DeleteLinkedCalendarAsync(Guid id)
        {
            await ApartmentService.DeleteLinkedCalendarAsync(id);

            return Ok();
        }

        // POST api/apartments/{apartmentId}/linked-calendars/{linkedCalendarId}/sync
        [HttpPost("{apartmentId}/linked-calendars/{id}/sync")]
        public async Task<ActionResult<LinkedCalendar>> SyncLinkedCalendarAsync(Guid apartmentId, Guid id)
        {
            await ApartmentService.SyncLinkedCalendarAsync(apartmentId, id);

            return Ok();
        }

        #endregion

        #region Integration Configuration

        // GET api/apartments/{apartmentId}/integration-configurations
        [HttpGet("{apartmentId}/integration-configurations")]
        public async Task<ActionResult<IEnumerable<IntegrationConfiguration>>> GetIntegrationConfigurationsAsync(Guid apartmentId)
        {
            var result = await ApartmentService.GetIntegrationConfigurationAsync(apartmentId);

            return Ok(result);
        }

        // POST api/apartments/{apartmentId}/integration-configurations
        [HttpPost("{apartmentId}/integration-configurations")]
        public async Task<ActionResult<IntegrationConfiguration>> CreateIntegrationConfigurationAsync(Guid apartmentId, [FromBody] IntegrationConfiguration entity)
        {
            entity.ApartmentId = apartmentId;
            var createdCalendar = await ApartmentService.CreateIntegrationConfigurationAsync(entity);

            var resourceUri = $"{Request.Path}/{createdCalendar.Id}";

            return Created(resourceUri, createdCalendar);
        }

        // PUT api/apartments/{apartmentId}/integration-configurations
        [HttpPut("{apartmentId}/integration-configurations/{id}")]
        public async Task<ActionResult<IntegrationConfiguration>> UpdateIntegrationConfigurationAsync(Guid apartmentId, Guid id, [FromBody] IntegrationConfiguration entity)
        {
            entity.ApartmentId = apartmentId;

            if (entity.Id != id) return BadRequest();

            var updated = await ApartmentService.UpdateIntegrationConfigurationAsync(entity);

            return Ok(updated);
        }

        #region Booking.com

        // POST api/apartments/{apartmentId}/booking-integration-setup/{pulseCode}
        [HttpPost("{apartmentId}/booking-integration-setup/{pulseCode}")]
        public async Task<ActionResult<IntegrationConfiguration>> UpdateBookingIntegrationConfigurationAsync(Guid apartmentId, string pulseCode)
        {
            var config = await ApartmentService.SetUpBookingIntegrationAsync(apartmentId, pulseCode);

            return Ok(config);
        }

        // POST api/apartments/{apartmentId}/sync-booking
        [HttpPost("{apartmentId}/sync-booking")]
        public async Task<ActionResult<IntegrationConfiguration>> SyncBookingReservationsAsync(Guid apartmentId, [FromQuery] string start = null, [FromQuery] string end = null)
        {
            var formatProvider = CultureInfo.CurrentCulture;

            var startDateSuccess = DateTime.TryParseExact(start, "yyyy-MM-dd", formatProvider, DateTimeStyles.AssumeLocal, out DateTime startDate);
            var endDateSuccess = DateTime.TryParseExact(end, "yyyy-MM-dd", formatProvider, DateTimeStyles.AssumeLocal, out DateTime endDate);

            DateTime? startDateParam = startDateSuccess ? startDate : default(DateTime?);
            DateTime? endDateParam = endDateSuccess ? endDate : default(DateTime?);

            var config = await ApartmentService.SyncBookingReservations(apartmentId, startDateParam, endDateParam);

            return Ok(config);
        }

        #endregion

        #region Airbnb

        // POST api/apartments/{apartmentId}/airbnb-integration-setup
        [HttpPost("{apartmentId}/airbnb-integration-setup")]
        public async Task<ActionResult<IntegrationConfiguration>> UpdateAirbnbIntegrationConfigurationAsync(Guid apartmentId)
        {
            var config = await ApartmentService.SetUpAirbnbIntegrationAsync(apartmentId);

            return Ok(config);
        }

        // POST api/apartments/{apartmentId}/sync-airbnb
        [HttpPost("{apartmentId}/sync-airbnb")]
        public async Task<ActionResult<IntegrationConfiguration>> SyncAirbnbReservationsAsync(Guid apartmentId, [FromQuery] string start = null, [FromQuery] string end = null)
        {
            var formatProvider = CultureInfo.CurrentCulture;

            var startDateSuccess = DateTime.TryParseExact(start, "yyyy-MM-dd", formatProvider, DateTimeStyles.AssumeLocal, out DateTime startDate);
            var endDateSuccess = DateTime.TryParseExact(end, "yyyy-MM-dd", formatProvider, DateTimeStyles.AssumeLocal, out DateTime endDate);

            DateTime? startDateParam = startDateSuccess ? startDate : default(DateTime?);
            DateTime? endDateParam = endDateSuccess ? endDate : default(DateTime?);

            var config = await ApartmentService.SyncAirbnbReservations(apartmentId, startDateParam, endDateParam);

            return Ok(config);
        }

        #endregion

        #endregion
    }
}
