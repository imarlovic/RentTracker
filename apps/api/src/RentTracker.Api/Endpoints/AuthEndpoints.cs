using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using RentTracker.Api.Contracts;
using RentTracker.Api.Options;
using RentTracker.Api.Services;
using RentTracker.Domain.Entities;
using RentTracker.Infrastructure.Persistence;

namespace RentTracker.Api.Endpoints;

public static class AuthEndpoints
{
    public static RouteGroupBuilder MapAuthEndpoints(this IEndpointRouteBuilder routes)
    {
        var group = routes.MapGroup("/api/auth").WithTags("Auth");

        group.MapPost("/google", SignInWithGoogleAsync);
        group.MapGet("/me", GetMeAsync).RequireAuthorization();

        return group;
    }

    private static async Task<IResult> SignInWithGoogleAsync(
        [FromBody] GoogleSignInRequest request,
        IGoogleTokenValidator googleTokenValidator,
        IJwtTokenService jwtTokenService,
        AppDbContext db,
        IOptions<JwtOptions> jwtOptions,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.IdToken))
        {
            return Results.BadRequest(new { error = "idToken is required." });
        }

        GoogleUserInfo googleUser;
        try
        {
            googleUser = await googleTokenValidator.ValidateAsync(request.IdToken, cancellationToken);
        }
        catch (Exception)
        {
            return Results.Unauthorized();
        }

        var user = await db.Users.FirstOrDefaultAsync(u => u.GoogleSubject == googleUser.Subject, cancellationToken);
        if (user is null)
        {
            user = new User
            {
                Email = googleUser.Email,
                GoogleSubject = googleUser.Subject,
                FirstName = googleUser.GivenName,
                LastName = googleUser.FamilyName,
                PictureUrl = googleUser.PictureUrl
            };
            db.Users.Add(user);
        }
        else
        {
            user.Email = googleUser.Email;
            user.FirstName = googleUser.GivenName;
            user.LastName = googleUser.FamilyName;
            user.PictureUrl = googleUser.PictureUrl;
            user.LastLoginAt = DateTimeOffset.UtcNow;
        }

        await db.SaveChangesAsync(cancellationToken);

        var token = jwtTokenService.CreateToken(user);
        var expiresAt = DateTimeOffset.UtcNow.AddMinutes(jwtOptions.Value.ExpiryMinutes);

        return Results.Ok(new AuthResponse(
            token,
            expiresAt,
            new UserDto(user.Id, user.Email, user.FirstName, user.LastName, user.PictureUrl)));
    }

    private static async Task<IResult> GetMeAsync(
        HttpContext httpContext,
        AppDbContext db,
        CancellationToken cancellationToken)
    {
        var userId = Auth.CurrentUser.GetUserId(httpContext.User);
        var user = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
        if (user is null)
        {
            return Results.Unauthorized();
        }

        return Results.Ok(new UserDto(user.Id, user.Email, user.FirstName, user.LastName, user.PictureUrl));
    }
}
