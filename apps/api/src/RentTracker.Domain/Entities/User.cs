namespace RentTracker.Domain.Entities;

public class User : Entity
{
    public required string Email { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? PictureUrl { get; set; }

    /// <summary>Google subject ("sub") claim.</summary>
    public required string GoogleSubject { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset LastLoginAt { get; set; } = DateTimeOffset.UtcNow;

    public ICollection<Apartment> Apartments { get; set; } = new List<Apartment>();
    public ICollection<PushNotificationSubscription> PushSubscriptions { get; set; } = new List<PushNotificationSubscription>();
}
