
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RentTracker.Core.Entities
{
    public class Document : Entity
    {
        [Required]
        public string Title { get; set; }
        [Required]
        public byte[] Blob { get; set; }
        [Required]
        public string MimeType { get; set; }
        [Required]
        public string FileName { get; set; }
        [Required]
        public DateTime UploadTime { get; set; }
        [Required]
        public string FileExtension { get; set; }
        [Required]
        [ForeignKey("Apartment")]
        public Guid ApartmentId { get; set; }
        public Apartment Apartment { get; set; }
    }
}
