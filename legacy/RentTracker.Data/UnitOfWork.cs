using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using RentTracker.Core.Entities;
using RentTracker.Data.Interfaces;
using RentTracker.Data.Repositories;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace RentTracker.Data
{
    public class UnitOfWork : IUnitOfWork
    {
        internal Dictionary<Type, object> _repositories;
        internal readonly RentTrackerContext _context;
        public UnitOfWork(RentTrackerContext context)
        {
            _context = context;
            _repositories = new Dictionary<Type, object>();
        }

        public IGenericRepository<T> Repository<T>() where T : Entity, new()
        {
            var entityType = typeof(T);

            if(!_repositories.ContainsKey(entityType))
            {
                _repositories.Add(entityType, new GenericRepository<T>(_context));
            }

            return _repositories[entityType] as IGenericRepository<T>;
        }

        public Task<int> SaveAsync(CancellationToken cancellationToken = default)
        {
            return _context.SaveChangesAsync(cancellationToken);
        }
    }
}
