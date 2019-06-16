using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace RentTracker.Core.Entities
{
    public class User : Entity
    {
        public string SubjectId => Id.ToString();
        [Required]
        public string Email { get; set; }
        [Required]
        public string FirstName { get; set; }
        [Required]
        public string LastName { get; set; }
        [Required]
        public string UserName { get; set; }
        [Required]
        public string Password { get; set; }
        public string ExternalProvider { get; set; }
        public string ExternalId { get; set; }

        public ICollection<Claim> Claims { get; set;}
    }
}
