using CryptoHelper;
using IdentityModel;
using RentTracker.Core.Entities;
using RentTracker.Core.Interfaces;
using RentTracker.Core.Specifications.User;
using RentTracker.Data.Interfaces;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace RentTracker.Service
{
    public class UserStore : IUserStore
    {
        readonly IUnitOfWork UnitOfWork;
        public UserStore(IUnitOfWork unitOfWork)
        {
            UnitOfWork = unitOfWork;
        }
        public async Task<bool> ValidateCredentials(string username, string password)
        {
            string hash = Crypto.HashPassword(password); ;

            var specification = new SingleUserSpecification(username);
            var user = (await UnitOfWork.Repository<User>().FindBySpecification(specification)).SingleOrDefault();

            return user != null && Crypto.VerifyHashedPassword(user.Password, password);
        }

        public async Task<User> FindBySubjectId(string subjectId)
        {
            var specification = new UserBySubjectIdSpecification(subjectId);
            var user = (await UnitOfWork.Repository<User>().FindBySpecification(specification)).SingleOrDefault();

            return user;
        }

        public async Task<User> FindByUsername(string username)
        {
            var specification = new SingleUserSpecification(username);
            var user = (await UnitOfWork.Repository<User>().FindBySpecification(specification)).SingleOrDefault();

            return user;
        }

        public async Task<User> FindByExternalProvider(string provider, string externalId)
        {
            var specification = new SingleUserSpecification(provider, externalId);
            var user = (await UnitOfWork.Repository<User>().FindBySpecification(specification)).SingleOrDefault();

            return user;
        }

        public async Task<User> AutoProvisionUser(string provider, string externalId, IEnumerable<System.Security.Claims.Claim> claims)
        {
            // create a list of claims that we want to transfer into our store
            var filtered = new List<System.Security.Claims.Claim >();

            foreach (var claim in claims)
            {
                // if the external system sends a display name - translate that to the standard OIDC name claim
                if (claim.Type == ClaimTypes.Name)
                {
                    filtered.Add(new System.Security.Claims.Claim(JwtClaimTypes.Name, claim.Value));
                }
                // if the JWT handler has an outbound mapping to an OIDC claim use that
                else if (JwtSecurityTokenHandler.DefaultOutboundClaimTypeMap.ContainsKey(claim.Type))
                {
                    filtered.Add(new System.Security.Claims.Claim(JwtSecurityTokenHandler.DefaultOutboundClaimTypeMap[claim.Type], claim.Value));
                }
                // copy the claim as-is
                else
                {
                    filtered.Add(claim);
                }
            }

            // if no display name was provided, try to construct by first and/or last name
            if (!filtered.Any(x => x.Type == JwtClaimTypes.Name))
            {
                var first = filtered.FirstOrDefault(x => x.Type == JwtClaimTypes.GivenName)?.Value;
                var last = filtered.FirstOrDefault(x => x.Type == ClaimTypes.Surname)?.Value ?? filtered.FirstOrDefault(x => x.Type == JwtClaimTypes.FamilyName)?.Value;
                if (first != null && last != null)
                {
                    filtered.Add(new System.Security.Claims.Claim(JwtClaimTypes.Name, first + " " + last));
                }
                else if (first != null)
                {
                    filtered.Add(new System.Security.Claims.Claim(JwtClaimTypes.Name, first));
                }
                else if (last != null)
                {
                    filtered.Add(new System.Security.Claims.Claim(JwtClaimTypes.Name, last));
                }
            }

            var email = filtered.FirstOrDefault(c => c.Type == JwtClaimTypes.Email)?.Value ??
                filtered.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value ??
                throw new Exception("External service must provide Email claim for the user");

            // create new user
            var user = new User
            {
                FirstName = filtered.FirstOrDefault(c => c.Type == JwtClaimTypes.GivenName)?.Value,
                LastName = filtered.FirstOrDefault(c => c.Type == JwtClaimTypes.FamilyName)?.Value,
                UserName = email,
                Email = email,
                ExternalProvider = provider,
                ExternalId = externalId,
                Claims = filtered.Select(c => new Core.Entities.Claim
                {
                    Issuer = c.Issuer ?? string.Empty,
                    OriginalIssuer = c.OriginalIssuer ?? string.Empty,
                    Type = c.Type,
                    Value = c.Value,
                    ValueType = c.ValueType ?? string.Empty,
                }).ToArray()
            };

            // store it and give it back
            var saveSuccess = await SaveUser(user, externalId);

            if(!saveSuccess)
            {
                throw new Exception("Failed to save new external user");
            }

            user = await FindByExternalProvider(provider, externalId);
            return user;
        }

        public async Task<bool> SaveUser(User user, string newPasswordToHash = null)
        {
            bool success = true;

            try
            {
                var existingUser = await UnitOfWork.Repository<User>().Get(user.Id);

                if(existingUser is null)
                {
                    if(newPasswordToHash != null) user.Password = Crypto.HashPassword(newPasswordToHash);

                    await UnitOfWork.Repository<User>().Add(user);
                }
                else
                {
                    if (newPasswordToHash != null) existingUser.Password = Crypto.HashPassword(newPasswordToHash);

                    await UnitOfWork.Repository<User>().Update(existingUser);
                }

                await UnitOfWork.SaveAsync();
            }
            catch (Exception)
            {
                success = false;
            }

            return success;
        }
    }
}
