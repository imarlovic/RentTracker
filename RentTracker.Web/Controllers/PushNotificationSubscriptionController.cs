using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentTracker.Core.Entities;
using RentTracker.Core.Interfaces;
using RentTracker.Core.Models;
using RentTracker.Data.Interfaces;
using WebPush;

namespace RentTracker.Web.Controllers
{
    [Authorize]
    [Route("api/notifications")]
    [ApiController]
    public class PushNotificationSubscriptionController : ControllerBase
    {
        private readonly IPushNotificationService _pushNotificationService;
        private readonly IPushNotificationsQueue _pushNotificationsQueue;
        readonly VapidDetails _vapidDetails;
        public PushNotificationSubscriptionController(VapidDetails vapidDetails, IPushNotificationService pushNotificationService, IPushNotificationsQueue pushNotificationsQueue)
        {
            _vapidDetails = vapidDetails;
            _pushNotificationService = pushNotificationService;
            _pushNotificationsQueue = pushNotificationsQueue;
        }

        // GET api/notifications/public-key
        [HttpGet("public-key")]
        public ActionResult<string> GetPublicKeyAsync()
        {
            return Ok(_vapidDetails.PublicKey);
        }

        // POST api/notifications/subscribe
        [HttpPost("subscribe")]
        public async Task<ActionResult> SubscribeAsync([FromBody] PushNotificationSubscription subscription)
        {
            var sub = HttpContext.User.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;
            Guid.TryParse(sub, out Guid userId);

            if (userId == null) return BadRequest("Unable to convert sub claim to a valid user Id");

            subscription.UserId = userId;

            var created = await _pushNotificationService.StoreSubscriptionAsync(subscription);

            var resourceUri = $"{Request.Path}/{created.Id}";

            return Ok();
        }

        [HttpGet("test")]
        public ActionResult<PushNotification> GetPublicKeyAsync([FromQuery] string title = "TEST", [FromQuery] string body = "TEST")
        {
            var notification = new PushNotification(NotificationType.NewReservation) { Body = body, Title = title };
            _pushNotificationsQueue.Enqueue(notification);

            return Ok(notification);
        }

        // DELETE api/notifications/unsubscribe?endpoint={endpoint}
        [HttpDelete("api/notifications/unsubscribe")]
        public async Task<ActionResult> UnsubscibeAsync([FromQuery] string endpoint)
        {
            await _pushNotificationService.UnsubscribeAsync(endpoint);

            return Ok();
        }
    }
}
