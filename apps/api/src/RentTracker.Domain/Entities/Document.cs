namespace RentTracker.Domain.Entities;

public class Document : Entity
{
    public Guid ApartmentId { get; set; }
    public Apartment Apartment { get; set; } = null!;

    public required string Title { get; set; }
    public required string FileName { get; set; }
    public required string ContentType { get; set; }
    public long SizeBytes { get; set; }

    /// <summary>Object storage key (not stored in the database as binary).</summary>
    public required string BlobKey { get; set; }

    public DateTimeOffset UploadedAt { get; set; } = DateTimeOffset.UtcNow;
}
