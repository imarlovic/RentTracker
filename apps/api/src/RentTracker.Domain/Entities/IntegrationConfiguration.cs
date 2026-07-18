namespace RentTracker.Domain.Entities;

public class IntegrationConfiguration : Entity
{
    public Guid ApartmentId { get; set; }
    public Apartment Apartment { get; set; } = null!;

    public IntegrationProvider Provider { get; set; }
    public IntegrationStatus Status { get; set; } = IntegrationStatus.NotConfigured;

    public string? ExternalPropertyId { get; set; }
    public string? IcalUrl { get; set; }
    public DateTimeOffset? LastSyncedAt { get; set; }
}

public enum IntegrationProvider
{
    Booking = 0,
    Airbnb = 1
}

public enum IntegrationStatus
{
    NotConfigured = 0,
    Active = 1,
    Error = 2
}
