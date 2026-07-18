using RentTracker.Core.Entities;
using RentTracker.Core.Interfaces;
using RentTracker.Data.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RentTracker.Service
{
    public class LinkedCalendarService : ILinkedCalendarService
    {
        readonly IUnitOfWork _unitOfWork;
        public LinkedCalendarService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }
        public Task<LinkedCalendar> CreateAsync(LinkedCalendar entity)
        {
            throw new NotImplementedException();
        }

        public Task DeleteAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public Task<LinkedCalendar> GetAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<LinkedCalendar>> GetAsync(ISpecification<LinkedCalendar> specification) => _unitOfWork.Repository<LinkedCalendar>().FindBySpecification(specification);

        public Task<LinkedCalendar> UpdateAsync(LinkedCalendar entity)
        {
            throw new NotImplementedException();
        }
    }
}
