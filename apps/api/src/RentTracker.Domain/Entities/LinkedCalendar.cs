namespace RentTracker.Domain.Entities;

public class LinkedCalendar : Entity
{
    public Guid ApartmentId { get; set; }
    public Apartment Apartment { get; set; } = null!;

    public required string Name { get; set; }
    public required string Url { get; set; }
    public DateTimeOffset? LastSyncedAt { get; set; }
}
