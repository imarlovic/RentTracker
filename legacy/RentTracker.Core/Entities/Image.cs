
using System;

namespace RentTracker.Core.Entities
{
    public class Image : Entity
    {
        public byte[] Data { get; set; }
        public DateTime UploadTime { get; set; }
        public string ContentType { get; set; }
    }
}
