namespace RentTracker.Core.Specifications.User
{
    public class UserBySubjectIdSpecification : BaseSpecification<Entities.User>
    {
        public UserBySubjectIdSpecification(string subjectId)
        {
            DefaultCriteria = u => u.SubjectId == subjectId;

            AddInclude(u => u.Claims);
        }
    }
}
