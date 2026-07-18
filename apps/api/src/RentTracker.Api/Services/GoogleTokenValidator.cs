using Google.Apis.Auth;
using Microsoft.Extensions.Options;
using RentTracker.Api.Options;

namespace RentTracker.Api.Services;

public record GoogleUserInfo(
    string Subject,
    string Email,
    string? GivenName,
    string? FamilyName,
    string? PictureUrl);

public interface IGoogleTokenValidator
{
    Task<GoogleUserInfo> ValidateAsync(string idToken, CancellationToken cancellationToken = default);
}

public class GoogleTokenValidator(IOptions<GoogleAuthOptions> options) : IGoogleTokenValidator
{
    private readonly GoogleAuthOptions _options = options.Value;

    public async Task<GoogleUserInfo> ValidateAsync(string idToken, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_options.ClientId))
        {
            throw new InvalidOperationException("Google:ClientId is not configured.");
        }

        var settings = new GoogleJsonWebSignature.ValidationSettings
        {
            Audience = [_options.ClientId]
        };

        var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
        if (string.IsNullOrWhiteSpace(payload.Email))
        {
            throw new InvalidOperationException("Google token did not include an email claim.");
        }

        return new GoogleUserInfo(
            payload.Subject,
            payload.Email,
            payload.GivenName,
            payload.FamilyName,
            payload.Picture);
    }
}
