using Microsoft.EntityFrameworkCore;
using RentTracker.Core.Entities;
using RentTracker.Core.Interfaces;
using RentTracker.Data.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RentTracker.Data.Repositories
{
    public class GenericRepository<T> : IGenericRepository<T> where T: Entity, new()
    {
        internal readonly RentTrackerContext Context;

        public GenericRepository(RentTrackerContext dbContext)
        {
            Context = dbContext;
        }

        public Task<IEnumerable<T>> FindBySpecification(ISpecification<T> spec)
        {
            // fetch a Queryable that includes all expression-based includes
            var queryableResultWithIncludes = spec.Includes
                .Aggregate(Context.Set<T>().AsQueryable(),
                    (current, include) => current.Include(include));

            // modify the IQueryable to include any string-based include statements
            var secondaryResult = spec.IncludeStrings
                .Aggregate(queryableResultWithIncludes,
                    (current, include) => current.Include(include));

            // return the result of the query using the specification's criteria expression
            var finalResult = spec.Criterias
                .Aggregate(secondaryResult, 
                    (current, criteria) => current.Where(criteria)).AsEnumerable();

            return Task.FromResult(finalResult);
        }

        //public Task<T> FindBySpecification(ISpecification<T> spec)
        //{
        //    // fetch a Queryable that includes all expression-based includes
        //    var queryableResultWithIncludes = spec.Includes
        //        .Aggregate(Context.Set<T>().AsQueryable(),
        //            (current, include) => current.Include(include));

        //    // modify the IQueryable to include any string-based include statements
        //    var secondaryResult = spec.IncludeStrings
        //        .Aggregate(queryableResultWithIncludes,
        //            (current, include) => current.Include(include));

        //    // return the result of the query using the specification's criteria expression
        //    var finalResult = spec.Criterias
        //        .Aggregate(secondaryResult,
        //            (current, criteria) => current.Where(criteria)).SingleOrDefaultAsync();

        //    return finalResult;
        //}

        public Task<T> Get(Guid id)
        {
            return Context.FindAsync<T>(id);
        }

        public Task<IEnumerable<T>> Get()
        {
            return Task.FromResult(Context.Set<T>().AsEnumerable());
        }

        public async Task Add(T entity)
        {
            await Context.AddAsync(entity);
        }

        public Task Update(T entity)
        {
            Context.Update(entity);

            return Task.CompletedTask;
        }

        public Task Delete(T entity)
        {
            Context.Remove(entity);

            return Task.CompletedTask;
        }
    }
}
