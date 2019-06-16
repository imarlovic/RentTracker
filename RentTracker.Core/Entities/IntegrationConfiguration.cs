using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace RentTracker.Core.Entities
{
    public class IntegrationConfiguration : Entity
    {
        [Required]
        [JsonConverter(typeof(StringEnumConverter))]
        public IntegrationProvider Provider { get; set; }
        [JsonConverter(typeof(StringEnumConverter))]
        public IntegrationStatus Status { get; set; }

        [JsonIgnore]
        public string StateJson { get; set; }
        public string PropertyId { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        [Required]
        [ForeignKey("Apartment")]
        public Guid ApartmentId { get; set; }
        public Apartment Apartment { get; set; }
        public DateTime LastUpdated { get; set; }
    }

    public enum IntegrationProvider
    {
        Booking = 0,
        Airbnb = 1
    }

    public enum IntegrationStatus
    {
        NotConfigured = 0,
        Failed = 1,
        Working = 2,
        Disabled = 3,
    }
}
