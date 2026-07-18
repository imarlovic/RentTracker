using IdentityServer4.Extensions;
using IdentityServer4.Models;
using IdentityServer4.Services;
using RentTracker.Core.Interfaces;
using System.Linq;
using System.Threading.Tasks;

namespace RentTracker.Web.Services
{
    public class UserProfileService : IProfileService
    {
        protected readonly IUserStore UserStore;
        public UserProfileService(IUserStore userStore)
        {
            UserStore = userStore;
        }
        public async Task GetProfileDataAsync(ProfileDataRequestContext context)
        {
            if (context.RequestedClaimTypes.Any())
            {
                var user = await UserStore.FindBySubjectId(context.Subject.GetSubjectId());

                if (user != null)
                {
                    var claims = user.Claims.Select(c => new System.Security.Claims.Claim(issuer: c.Issuer, originalIssuer: c.OriginalIssuer, type: c.Type, value: c.Value, valueType: c.ValueType));

                    context.AddRequestedClaims(claims);
                }
            }
        }

        public async Task IsActiveAsync(IsActiveContext context)
        {
            var user = await UserStore.FindBySubjectId(context.Subject.GetSubjectId());

            context.IsActive = !(user is null); // TODO check indicators like account status
        }
    }
}
