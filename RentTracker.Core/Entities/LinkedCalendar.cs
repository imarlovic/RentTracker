using Newtonsoft.Json;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentTracker.Core.Entities
{
    public class LinkedCalendar : Entity
    {
        [Required]
        public string Name { get; set; }
        [Required]
        public string Url { get; set; }

        [Required]
        [ForeignKey("Apartment")]
        public Guid ApartmentId { get; set; }
        public Apartment Apartment { get; set; }

        public DateTime? LastUpdated { get; set; }
    }
}
