using RentTracker.Core.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace RentTracker.Core.Interfaces
{
    public interface IService<TEntity> where TEntity : Entity
    {
        Task<TEntity> GetAsync(Guid id);
        Task<IEnumerable<TEntity>> GetAsync(ISpecification<TEntity> specification);
        Task<TEntity> CreateAsync(TEntity entity);
        Task<TEntity> UpdateAsync(TEntity entity);
        Task DeleteAsync(Guid id);
    }
}
