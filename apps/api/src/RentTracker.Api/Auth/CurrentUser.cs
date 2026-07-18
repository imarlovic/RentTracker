using System.Security.Claims;

namespace RentTracker.Api.Auth;

public static class CurrentUser
{
    public static Guid GetUserId(ClaimsPrincipal user)
    {
        var sub = user.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? user.FindFirstValue("sub");

        if (sub is null || !Guid.TryParse(sub, out var userId))
        {
            throw new UnauthorizedAccessException("Authenticated user id is missing or invalid.");
        }

        return userId;
    }
}
