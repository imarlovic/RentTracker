namespace RentTracker.Domain.Entities;

public class Apartment : Entity
{
    public required string Name { get; set; }
    public Guid OwnerId { get; set; }
    public User Owner { get; set; } = null!;

    /// <summary>Object storage key for header image, if any.</summary>
    public string? HeaderBlobKey { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
    public ICollection<Document> Documents { get; set; } = new List<Document>();
    public ICollection<LinkedCalendar> LinkedCalendars { get; set; } = new List<LinkedCalendar>();
    public ICollection<IntegrationConfiguration> IntegrationConfigurations { get; set; } = new List<IntegrationConfiguration>();
}
