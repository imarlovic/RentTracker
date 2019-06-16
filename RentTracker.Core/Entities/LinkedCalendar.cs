using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentTracker.Core.Entities
{
    public class LinkedCalendar : Entity
    {
        public string Name { get; set; }
        public string Url { get; set; }

        [ForeignKey("Apartment")]
        public Guid ApartmentId { get; set; }
        //[JsonConverter(typeof(StringEnumConverter))]
        //public Source Source { get; set; }
        public Apartment Apartment { get; set; }
    }
}
