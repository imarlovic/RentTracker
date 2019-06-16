using RentTracker.Core.Entities;
using RentTracker.Core.Interfaces;
using RentTracker.Data.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RentTracker.Service
{
    public class IntegrationConfigurationService : IIntegrationConfigurationService
    {
        readonly IUnitOfWork UnitOfWork;
        public IntegrationConfigurationService(IUnitOfWork unitOfWork)
        {
            UnitOfWork = unitOfWork;
        }

        public Task<IntegrationConfiguration> CreateAsync(IntegrationConfiguration entity)
        {
            throw new NotImplementedException();
        }

        public Task DeleteAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public Task<IntegrationConfiguration> GetAsync(Guid id)
        {
            throw new NotImplementedException();
        }

        public Task<IEnumerable<IntegrationConfiguration>> GetAsync(ISpecification<IntegrationConfiguration> specification) => UnitOfWork.Repository<IntegrationConfiguration>().FindBySpecification(specification);

        public Task<IntegrationConfiguration> UpdateAsync(IntegrationConfiguration entity)
        {
            throw new NotImplementedException();
        }
    }
}
