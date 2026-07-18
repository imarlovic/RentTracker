namespace RentTracker.Api.Contracts;

public record GoogleSignInRequest(string IdToken);

public record AuthResponse(
    string AccessToken,
    DateTimeOffset ExpiresAt,
    UserDto User);

public record UserDto(
    Guid Id,
    string Email,
    string? FirstName,
    string? LastName,
    string? PictureUrl);

public record ApartmentDto(Guid Id, string Name, string? HeaderBlobKey, DateTimeOffset CreatedAt);

public record CreateApartmentRequest(string Name);

public record UpdateApartmentRequest(string Name);

public record ReservationDto(
    Guid Id,
    Guid ApartmentId,
    string State,
    string Source,
    string HoldingName,
    DateOnly StartDate,
    DateOnly EndDate,
    decimal? Price,
    decimal? Commission,
    string Currency,
    string? Country,
    int? People);

public record CreateReservationRequest(
    string HoldingName,
    DateOnly StartDate,
    DateOnly EndDate,
    string? Source,
    decimal? Price,
    decimal? Commission,
    string? Currency,
    string? Country,
    int? People);

public record UpdateReservationRequest(
    string HoldingName,
    DateOnly StartDate,
    DateOnly EndDate,
    string? State,
    string? Source,
    decimal? Price,
    decimal? Commission,
    string? Currency,
    string? Country,
    int? People);
