namespace RentTracker.Domain.Entities;

public class Reservation : Entity
{
    public Guid ApartmentId { get; set; }
    public Apartment Apartment { get; set; } = null!;

    public ReservationState State { get; set; } = ReservationState.Active;
    public string? ExternalId { get; set; }
    public string? Reference { get; set; }
    public DateTimeOffset? BookingDate { get; set; }

    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public ReservationSource Source { get; set; } = ReservationSource.RentTracker;

    public required string HoldingName { get; set; }

    public int? People { get; set; }
    public int? Adults { get; set; }
    public int? Children { get; set; }
    public int? Infants { get; set; }

    public decimal? Price { get; set; }
    public decimal? Commission { get; set; }
    public Currency Currency { get; set; } = Currency.EUR;
    public string? Country { get; set; }

    public decimal Earnings => (Price ?? 0) - (Commission ?? 0);
}

public enum ReservationState
{
    Active = 0,
    Canceled = 1
}

public enum ReservationSource
{
    RentTracker = 0,
    Airbnb = 1,
    Booking = 2,
    Other = 3
}

public enum Currency
{
    EUR = 0
}
