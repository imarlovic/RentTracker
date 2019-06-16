using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using IdentityModel;
using IdentityServer;
using IdentityServer4;
using IdentityServer4.Models;
using IdentityServer4.Services;
using IdentityServer4.Stores;
using IdentityServer4.Test;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RentTracker.Core.Entities;
using RentTracker.Core.Interfaces;
using RentTracker.Web.Models;

namespace RentTracker.Web.Controllers
{
    [AllowAnonymous]
    [Route("auth")]
    public class AuthController : Controller
    {
        private readonly IUserStore _userStore;
        private readonly IIdentityServerInteractionService _interaction;
        private readonly IClientStore _clientStore;
        private readonly IAuthenticationSchemeProvider _schemeProvider;

        public AuthController(
            IIdentityServerInteractionService interaction,
            IClientStore clientStore,
            IAuthenticationSchemeProvider schemeProvider,
            IUserStore userStore = null)
        {
            // if the TestUserStore is not in DI, then we'll just use the global users collection
            // this is where you would plug in your own custom identity management library (e.g. ASP.NET Identity)
            _userStore = userStore ?? throw new ArgumentNullException("User store not provided");

            _interaction = interaction;
            _clientStore = clientStore;
            _schemeProvider = schemeProvider;
        }

        [HttpGet("login")]
        public IActionResult Login(string returnUrl)
        {
            return File("index.html", "text/html");
        }

        /// <summary>
        /// Handle postback from username/password login
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login(IdentityServer.LoginInputModel model)
        {

            if (ModelState.IsValid)
            {
                // validate username/password against in-memory store
                if (await _userStore.ValidateCredentials(model.Username, model.Password))
                {
                    var user = await _userStore.FindByUsername(model.Username);

                    // only set explicit expiration here if user chooses "remember me". 
                    // otherwise we rely upon expiration configured in cookie middleware.
                    AuthenticationProperties authProperties = null;
                    if (AccountOptions.AllowRememberLogin && model.RememberLogin)
                    {
                        authProperties = new AuthenticationProperties
                        {
                            IsPersistent = true,
                            ExpiresUtc = DateTimeOffset.UtcNow.Add(AccountOptions.RememberMeLoginDuration)
                        };
                    };

                    // issue authentication cookie with subject ID and username
                    await HttpContext.SignInAsync(user.SubjectId, user.UserName, authProperties);

                    // request for a local page
                    if (Url.IsLocalUrl(model.ReturnUrl))
                    {
                        return Redirect(model.ReturnUrl);
                    }
                    else if (string.IsNullOrEmpty(model.ReturnUrl))
                    {
                        return Redirect("~/");
                    }
                    else
                    {
                        // user might have clicked on a malicious link - should be logged
                        throw new Exception("invalid return URL");
                    }
                }

                ModelState.AddModelError(string.Empty, AccountOptions.InvalidCredentialsErrorMessage);
            }

            return Redirect("/auth/login");
        }

        [HttpGet("sign-out")]
        public async Task<IActionResult> ExternalAsync()
        {
            await HttpContext.SignOutAsync();

            return Redirect("/auth/login");
        }

        [HttpGet("external")]
        public IActionResult ExternalAsync(string provider, string returnUrl)
        {
            // start challenge and roundtrip the return URL and scheme 
            var props = new AuthenticationProperties
            {
                RedirectUri = "/auth/external-callback",
                Items =
                {
                    { "returnUrl", returnUrl },
                    { "scheme", provider },
                }
            };

            return Challenge(props, provider);
        }

        /// <summary>
        /// Post processing of external authentication
        /// </summary>
        [HttpGet("external-callback")]
        public async Task<IActionResult> ExternalCallback()
        {
            // read external identity from the temporary cookie
            var result = await HttpContext.AuthenticateAsync(IdentityServer4.IdentityServerConstants.ExternalCookieAuthenticationScheme);
            if (result?.Succeeded != true)
            {
                throw new Exception("External authentication error");
            }

            // lookup our user and external provider info
            var (user, provider, providerUserId, claims) = await FindUserFromExternalProvider(result);

            if (user == null)
            {
                // this might be where you might initiate a custom workflow for user registration
                // in this sample we don't show how that would be done, as our sample implementation
                // simply auto-provisions new external user
                user = await _userStore.AutoProvisionUser(provider, providerUserId, claims);
            }

            // issue authentication cookie for user
            await HttpContext.SignInAsync(user.SubjectId, user.UserName, provider);

            // delete temporary cookie used during external authentication
            await HttpContext.SignOutAsync(IdentityServer4.IdentityServerConstants.ExternalCookieAuthenticationScheme);

            // retrieve return URL
            var returnUrl = result.Properties.Items["returnUrl"] ?? "/";

            return Redirect(returnUrl);
        }

        /// <summary>
        /// Handle postback from register
        /// </summary>
        [HttpPost("register")]
        public async Task<IActionResult> SignUp(User model)
        {
            if (ModelState.IsValid)
            {
                var existingUser = await _userStore.FindByUsername(model.UserName);

                // validate username is unused
                if (existingUser is null)
                {
                    var userCreated = await _userStore.SaveUser(model, model.Password);
                    var createdUser = await _userStore.FindByUsername(model.UserName);

                    if (userCreated && createdUser != null)
                    {
                        // issue authentication cookie with subject ID and username
                        await HttpContext.SignInAsync(createdUser.SubjectId, createdUser.UserName);

                        return Redirect("/");
                    }
                }

                ModelState.AddModelError(string.Empty, "Username taken");
            }

            return Redirect("/auth/login");
        }

        private async Task<(User user, string provider, string providerUserId, IEnumerable<System.Security.Claims.Claim> claims)> FindUserFromExternalProvider(AuthenticateResult result)
        {
            var externalUser = result.Principal;

            // try to determine the unique id of the external user (issued by the provider)
            // the most common claim type for that are the sub claim and the NameIdentifier
            // depending on the external provider, some other claim type might be used
            var userIdClaim = externalUser.FindFirst(JwtClaimTypes.Subject) ??
                              externalUser.FindFirst(ClaimTypes.NameIdentifier) ??
                              throw new Exception("Userid not found on external provider");

            // remove the user id claim so we don't include it as an extra claim if/when we provision the user
            var claims = externalUser.Claims.ToList();
            claims.Remove(userIdClaim);

            var provider = result.Properties.Items["scheme"];
            var providerUserId = userIdClaim.Value;

            // find external user
            var user = await _userStore.FindByExternalProvider(provider, providerUserId);

            return (user, provider, providerUserId, claims);
        }
    }
}