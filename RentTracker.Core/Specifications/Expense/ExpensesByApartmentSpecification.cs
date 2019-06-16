using System;
using System.Collections.Generic;
using System.Linq.Expressions;

namespace RentTracker.Core.Specifications.Expense
{
    public class ExpensesByApartmentSpecification : BaseSpecification<Entities.Expense>
    {
        public Guid ApartmentId { get; set; }
        public int? Year { get; set; }
        public int? Month { get; set; }
        public ExpensesByApartmentSpecification(Guid apartmentId, int? year = null, int? month = null)
        {
            DefaultCriteria = e => e.ApartmentId == apartmentId;
            Year = year;
            Month = month;
        }

        public override ICollection<Expression<Func<Entities.Expense, bool>>> Criterias
        {
            get
            {
                var criterias = new List<Expression<Func<Entities.Expense, bool>>> { DefaultCriteria };

                if (Year.HasValue) criterias.Add(e => e.Date.Year == Year);
                if (Month.HasValue) criterias.Add(e => e.Date.Month == Month);

                return criterias;
            }
        }
    }
}
