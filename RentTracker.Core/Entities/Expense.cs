using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentTracker.Core.Entities
{
    public class Expense : Entity
    {
        private const string DecimalPrecisionScale = "decimal(9, 2)";
        public string Name { get; set; }
        public string Description { get; set; }
        [Required]
        public DateTime Date { get; set; }
        [Column(TypeName = DecimalPrecisionScale)]
        public decimal Amount { get; set; }
        [JsonConverter(typeof(StringEnumConverter))]
        public Currency Currency { get; set; }

        [Required]
        [ForeignKey("Apartment")]
        public Guid ApartmentId { get; set; }
        public Apartment Apartment { get; set; }
    }

    
}
