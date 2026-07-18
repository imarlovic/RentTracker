using Microsoft.EntityFrameworkCore.ChangeTracking;
using RentTracker.Core.Entities;
using System.Threading;
using System.Threading.Tasks;

namespace RentTracker.Data.Interfaces
{
    public interface IUnitOfWork
    {
        IGenericRepository<T> Repository<T>() where T : Entity, new();

        Task<int> SaveAsync(CancellationToken cancellationToken = default);
    }
}
