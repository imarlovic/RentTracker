using Newtonsoft.Json;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentTracker.Core.Entities
{
    public class PushNotificationSubscription : Entity
    {
        [Required]
        [JsonProperty("endpoint")]
        public string Endpoint { get; set; }
        [Required]
        [JsonProperty("p256dh")]
        public string P256DH { get; set; }
        [Required]
        [JsonProperty("auth")]
        public string Auth { get; set; }
        [Required]
        [ForeignKey("User")]
        public Guid UserId { get; set; }
        public User User { get; set; }
    }
}
