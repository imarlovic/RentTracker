using RentTracker.Core.Entities;
using RentTracker.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace RentTracker.Data.Interfaces
{
    public interface IGenericRepository<T> where T : Entity, new()
    {
        Task<T> Get(Guid id);
        Task<IEnumerable<T>> Get();
        Task Delete(T entity);
        Task Update(T entity);
        Task Add(T entity);
        Task<IEnumerable<T>> FindBySpecification(ISpecification<T> spec);
    }
}
