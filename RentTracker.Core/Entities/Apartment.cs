using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentTracker.Core.Entities
{
    public class Apartment : Entity
    {
        public string Name { get; set; }

        [ForeignKey("Owner")]
        public Guid OwnerId { get; set; }
        public User Owner { get; set; }

        [ForeignKey("Header")]
        public Guid? HeaderId { get; set; }
        public Image Header { get; set; }
        public string HeaderUrl => HeaderId.HasValue ? $"/api/img/{HeaderId}" : null;

    }
}
