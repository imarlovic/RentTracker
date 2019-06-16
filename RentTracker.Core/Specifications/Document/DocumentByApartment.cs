using System;
using System.Collections.Generic;
using System.Linq.Expressions;

namespace RentTracker.Core.Specifications.Document
{
    public class DocumentByApartment: BaseSpecification<Entities.Document>
    {
        public Guid ApartmentId { get; set; }
        public int? Year { get; set; }
        public int? Month { get; set; }
        public DocumentByApartment(Guid apartmentId)
        {
            DefaultCriteria = e => e.ApartmentId == apartmentId;

            Projection = d => new Entities.Document
            {
                Id = d.Id,
                Title = d.Title,
                FileName = d.FileName,
                FileExtension = d.FileExtension,
                UploadTime = d.UploadTime,
                ApartmentId = d.ApartmentId
            };
        }
    }
}
