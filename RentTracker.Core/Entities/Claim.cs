using System;

namespace RentTracker.Core.Entities
{
    public class Claim : Entity
    {
        public Guid UserId { get; set; }
        public string Issuer { get; set; }
        public string OriginalIssuer { get; set; }
        public string Subject { get; set; }
        public string Type { get; set; }
        public string Value { get; set; }
        public string ValueType { get; set; }
    }
}
