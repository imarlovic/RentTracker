using System;
using System.Collections.Generic;
using System.Linq.Expressions;

namespace RentTracker.Core.Interfaces
{
    public interface ISpecification<T>
    {
        ICollection<Expression<Func<T, bool>>> Criterias { get; }
        ICollection<Expression<Func<T, object>>> Includes { get; }
        ICollection<string> IncludeStrings { get; }
    }
}
