using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentTracker.Core.Entities
{
    public class Reservation : Entity
    {
        private const string DecimalPrecisionScale = "decimal(9, 2)";

        [JsonConverter(typeof(StringEnumConverter))]
        public ReservationState? State { get; set; }

        public string ExternalId { get; set; }
        public string Reference { get; set; }
        public DateTime? BookingDate { get; set; }

        [Required]
        public DateTime StartDate { get; set; }
        [Required]
        public DateTime EndDate { get; set; }
        [Required]
        [JsonConverter(typeof(StringEnumConverter))]
        public Source Source { get; set; }

        [Required]
        public string HoldingName { get; set; }

        public int? People { get; set; }
        public int? Adults { get; set; }
        public int? Children { get; set; }
        public int? Infants { get; set; }

        [Column(TypeName = DecimalPrecisionScale)]
        public decimal? Price { get; set; }
        [Column(TypeName = DecimalPrecisionScale)]
        public decimal? Commission { get; set; }
        [JsonConverter(typeof(StringEnumConverter))]
        public Currency Currency { get; set; }
        public decimal? Earnings => Price.GetValueOrDefault() - Commission.GetValueOrDefault();

        public string Country { get; set; }

        [Required]
        [ForeignKey("Apartment")]
        public Guid ApartmentId { get; set; }
        public Apartment Apartment { get; set; }
    }

    public enum ReservationState
    {
        Active,
        Canceled
    }
}
