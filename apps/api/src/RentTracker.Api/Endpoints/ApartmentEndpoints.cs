using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RentTracker.Api.Auth;
using RentTracker.Api.Contracts;
using RentTracker.Domain.Entities;
using RentTracker.Infrastructure.Persistence;

namespace RentTracker.Api.Endpoints;

public static class ApartmentEndpoints
{
    public static RouteGroupBuilder MapApartmentEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/apartments")
            .WithTags("Apartments")
            .RequireAuthorization();

        group.MapGet("/", ListAsync);
        group.MapPost("/", CreateAsync);
        group.MapGet("/{apartmentId:guid}", GetAsync);
        group.MapPut("/{apartmentId:guid}", UpdateAsync);
        group.MapDelete("/{apartmentId:guid}", DeleteAsync);

        group.MapGet("/{apartmentId:guid}/reservations", ListReservationsAsync);
        group.MapPost("/{apartmentId:guid}/reservations", CreateReservationAsync);
        group.MapPut("/{apartmentId:guid}/reservations/{reservationId:guid}", UpdateReservationAsync);
        group.MapDelete("/{apartmentId:guid}/reservations/{reservationId:guid}", DeleteReservationAsync);

        return group;
    }

    private static async Task<IResult> ListAsync(HttpContext httpContext, AppDbContext db, CancellationToken ct)
    {
        var userId = CurrentUser.GetUserId(httpContext.User);
        var apartments = await db.Apartments.AsNoTracking()
            .Where(a => a.OwnerId == userId)
            .OrderBy(a => a.Name)
            .Select(a => new ApartmentDto(a.Id, a.Name, a.HeaderBlobKey, a.CreatedAt))
            .ToListAsync(ct);

        return Results.Ok(apartments);
    }

    private static async Task<IResult> CreateAsync(
        [FromBody] CreateApartmentRequest request,
        HttpContext httpContext,
        AppDbContext db,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return Results.BadRequest(new { error = "Name is required." });
        }

        var userId = CurrentUser.GetUserId(httpContext.User);
        var apartment = new Apartment
        {
            Name = request.Name.Trim(),
            OwnerId = userId
        };

        db.Apartments.Add(apartment);
        await db.SaveChangesAsync(ct);

        return Results.Created($"/api/apartments/{apartment.Id}",
            new ApartmentDto(apartment.Id, apartment.Name, apartment.HeaderBlobKey, apartment.CreatedAt));
    }

    private static async Task<IResult> GetAsync(Guid apartmentId, HttpContext httpContext, AppDbContext db, CancellationToken ct)
    {
        var apartment = await GetOwnedApartmentAsync(apartmentId, httpContext, db, ct);
        if (apartment is null)
        {
            return Results.NotFound();
        }

        return Results.Ok(new ApartmentDto(apartment.Id, apartment.Name, apartment.HeaderBlobKey, apartment.CreatedAt));
    }

    private static async Task<IResult> UpdateAsync(
        Guid apartmentId,
        [FromBody] UpdateApartmentRequest request,
        HttpContext httpContext,
        AppDbContext db,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            return Results.BadRequest(new { error = "Name is required." });
        }

        var apartment = await GetOwnedApartmentAsync(apartmentId, httpContext, db, ct);
        if (apartment is null)
        {
            return Results.NotFound();
        }

        apartment.Name = request.Name.Trim();
        await db.SaveChangesAsync(ct);

        return Results.Ok(new ApartmentDto(apartment.Id, apartment.Name, apartment.HeaderBlobKey, apartment.CreatedAt));
    }

    private static async Task<IResult> DeleteAsync(Guid apartmentId, HttpContext httpContext, AppDbContext db, CancellationToken ct)
    {
        var apartment = await GetOwnedApartmentAsync(apartmentId, httpContext, db, ct);
        if (apartment is null)
        {
            return Results.NotFound();
        }

        db.Apartments.Remove(apartment);
        await db.SaveChangesAsync(ct);
        return Results.NoContent();
    }

    private static async Task<IResult> ListReservationsAsync(
        Guid apartmentId,
        HttpContext httpContext,
        AppDbContext db,
        CancellationToken ct)
    {
        if (await GetOwnedApartmentAsync(apartmentId, httpContext, db, ct) is null)
        {
            return Results.NotFound();
        }

        var reservations = await db.Reservations.AsNoTracking()
            .Where(r => r.ApartmentId == apartmentId)
            .OrderBy(r => r.StartDate)
            .ToListAsync(ct);

        return Results.Ok(reservations.Select(ToDto));
    }

    private static async Task<IResult> CreateReservationAsync(
        Guid apartmentId,
        [FromBody] CreateReservationRequest request,
        HttpContext httpContext,
        AppDbContext db,
        CancellationToken ct)
    {
        if (await GetOwnedApartmentAsync(apartmentId, httpContext, db, ct) is null)
        {
            return Results.NotFound();
        }

        if (string.IsNullOrWhiteSpace(request.HoldingName) || request.EndDate < request.StartDate)
        {
            return Results.BadRequest(new { error = "Invalid reservation data." });
        }

        var reservation = new Reservation
        {
            ApartmentId = apartmentId,
            HoldingName = request.HoldingName.Trim(),
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Source = ParseSource(request.Source),
            Price = request.Price,
            Commission = request.Commission,
            Currency = ParseCurrency(request.Currency),
            Country = request.Country,
            People = request.People,
            State = ReservationState.Active
        };

        db.Reservations.Add(reservation);
        await db.SaveChangesAsync(ct);

        return Results.Created(
            $"/api/apartments/{apartmentId}/reservations/{reservation.Id}",
            ToDto(reservation));
    }

    private static async Task<IResult> UpdateReservationAsync(
        Guid apartmentId,
        Guid reservationId,
        [FromBody] UpdateReservationRequest request,
        HttpContext httpContext,
        AppDbContext db,
        CancellationToken ct)
    {
        if (await GetOwnedApartmentAsync(apartmentId, httpContext, db, ct) is null)
        {
            return Results.NotFound();
        }

        var reservation = await db.Reservations
            .FirstOrDefaultAsync(r => r.Id == reservationId && r.ApartmentId == apartmentId, ct);
        if (reservation is null)
        {
            return Results.NotFound();
        }

        if (string.IsNullOrWhiteSpace(request.HoldingName) || request.EndDate < request.StartDate)
        {
            return Results.BadRequest(new { error = "Invalid reservation data." });
        }

        reservation.HoldingName = request.HoldingName.Trim();
        reservation.StartDate = request.StartDate;
        reservation.EndDate = request.EndDate;
        reservation.Price = request.Price;
        reservation.Commission = request.Commission;
        reservation.Country = request.Country;
        reservation.People = request.People;

        if (!string.IsNullOrWhiteSpace(request.Source))
        {
            reservation.Source = ParseSource(request.Source);
        }

        if (!string.IsNullOrWhiteSpace(request.Currency))
        {
            reservation.Currency = ParseCurrency(request.Currency);
        }

        if (!string.IsNullOrWhiteSpace(request.State) &&
            Enum.TryParse<ReservationState>(request.State, true, out var state))
        {
            reservation.State = state;
        }

        await db.SaveChangesAsync(ct);
        return Results.Ok(ToDto(reservation));
    }

    private static async Task<IResult> DeleteReservationAsync(
        Guid apartmentId,
        Guid reservationId,
        HttpContext httpContext,
        AppDbContext db,
        CancellationToken ct)
    {
        if (await GetOwnedApartmentAsync(apartmentId, httpContext, db, ct) is null)
        {
            return Results.NotFound();
        }

        var reservation = await db.Reservations
            .FirstOrDefaultAsync(r => r.Id == reservationId && r.ApartmentId == apartmentId, ct);
        if (reservation is null)
        {
            return Results.NotFound();
        }

        db.Reservations.Remove(reservation);
        await db.SaveChangesAsync(ct);
        return Results.NoContent();
    }

    private static async Task<Apartment?> GetOwnedApartmentAsync(
        Guid apartmentId,
        HttpContext httpContext,
        AppDbContext db,
        CancellationToken ct)
    {
        var userId = CurrentUser.GetUserId(httpContext.User);
        return await db.Apartments
            .FirstOrDefaultAsync(a => a.Id == apartmentId && a.OwnerId == userId, ct);
    }

    private static ReservationDto ToDto(Reservation r) => new(
        r.Id,
        r.ApartmentId,
        r.State.ToString(),
        r.Source.ToString(),
        r.HoldingName,
        r.StartDate,
        r.EndDate,
        r.Price,
        r.Commission,
        r.Currency.ToString(),
        r.Country,
        r.People);

    private static ReservationSource ParseSource(string? source) =>
        Enum.TryParse<ReservationSource>(source, true, out var value) ? value : ReservationSource.RentTracker;

    private static Currency ParseCurrency(string? currency) =>
        Enum.TryParse<Currency>(currency, true, out var value) ? value : Currency.EUR;
}
