using RentTracker.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RentTracker.Core.Interfaces
{
    public interface IUserStore
    {
        Task<bool> SaveUser(User user, string newPasswordToHash = null);
        //
        // Summary:
        //     Automatically provisions a user.
        //
        // Parameters:
        //   provider:
        //     The provider.
        //
        //   userId:
        //     The user identifier.
        //
        //   claims:
        //     The claims.
        Task<User> AutoProvisionUser(string provider, string externalId, IEnumerable<System.Security.Claims.Claim> claims);
        //
        // Summary:
        //     Finds the user by external provider.
        //
        // Parameters:
        //   provider:
        //     The provider.
        //
        //   userId:
        //     The user identifier.
        Task<User> FindByExternalProvider(string provider, string externalId);
        //
        // Summary:
        //     Finds the user by subject identifier.
        //
        // Parameters:
        //   subjectId:
        //     The subject identifier.
        Task<User> FindBySubjectId(string subjectId);
        //
        // Summary:
        //     Finds the user by username.
        //
        // Parameters:
        //   username:
        //     The username.
        Task<User> FindByUsername(string username);
        //
        // Summary:
        //     Validates the credentials.
        //
        // Parameters:
        //   username:
        //     The username.
        //
        //   password:
        //     The password.
        Task<bool> ValidateCredentials(string username, string password);
    }
}
