using RentTracker.Core.Entities;
using RentTracker.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;

namespace RentTracker.Core.Specifications
{
    public abstract class BaseSpecification<T> : ISpecification<T> where T : Entity
    {
        public BaseSpecification() { }
        public BaseSpecification(Expression<Func<T, bool>> criteria)
        {
            DefaultCriteria = criteria;
        }
        public Expression<Func<T, bool>> DefaultCriteria { get; set;  }
        public Func<T, T> Projection { get; set; }

        public virtual ICollection<Expression<Func<T, bool>>> Criterias
        {
            get
            {
                if (DefaultCriteria != null)
                {
                    return new[] { DefaultCriteria };
                }

                return new Expression<Func<T, bool>>[] { };
            }
        }
        public ICollection<Expression<Func<T, object>>> Includes { get; } =
                                               new List<Expression<Func<T, object>>>();

        public ICollection<string> IncludeStrings { get; } = new List<string>();

        protected virtual void AddInclude(params Expression<Func<T, object>>[] includeExpressions)
        {
            foreach(var include in includeExpressions)
            {
                Includes.Add(include);
            }
        }

        // string-based includes allow for including children of children
        // e.g. Basket.Items.Product
        protected virtual void AddInclude(params string[] includeStrings)
        {
            foreach (var include in includeStrings)
            {
                IncludeStrings.Add(include);
            }
        }
    }
}
