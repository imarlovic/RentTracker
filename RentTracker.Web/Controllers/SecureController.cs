using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace RentTracker.Web.Controllers
{
    [Authorize]
    [Route("secure")]
    public class SecureController : Controller
    {
        public async Task<IActionResult> IndexAsync()
        {
            var result = await HttpContext.AuthenticateAsync("oidc");
            var result2 = await HttpContext.AuthenticateAsync("Cookies");

            return Content("Welcome to the secure zone");
        }
    }
}