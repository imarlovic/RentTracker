using Microsoft.EntityFrameworkCore;
using RentTracker.Core.Entities;

namespace RentTracker.Data
{
    public class RentTrackerContext : DbContext
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Claim> Claims { get; set; }
        public DbSet<Apartment> Apartments { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<Expense> Expenses { get; set; }
        public DbSet<Document> Documents { get; set; }
        public DbSet<LinkedCalendar> LinkedCalendars { get; set; }
        public DbSet<Image> Images { get; set; }
        public DbSet<IntegrationConfiguration> IntegrationConfigurations { get; set; }
        public DbSet<PushNotificationSubscription> PushNotificationSubscriptions { get; set; }

        public RentTrackerContext() { }
        public RentTrackerContext(DbContextOptions<RentTrackerContext> options)
            : base(options)
        { }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseSqlServer(@"Data Source=(localdb)\MSSQLLocalDB;Initial Catalog=RentTrackerDevelopment;Integrated Security=True;Connect Timeout=30;Encrypt=False;TrustServerCertificate=False;ApplicationIntent=ReadWrite;MultiSubnetFailover=False");
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Reservation>().Property(b => b.Price).HasDefaultValue(0.0m);
            modelBuilder.Entity<Reservation>().Property(b => b.Commission).HasDefaultValue(0.0m);

            modelBuilder.Entity<Reservation>().Property(b => b.People).HasDefaultValue(0);
            modelBuilder.Entity<Reservation>().Property(b => b.Adults).HasDefaultValue(0);
            modelBuilder.Entity<Reservation>().Property(b => b.Children).HasDefaultValue(0);
            modelBuilder.Entity<Reservation>().Property(b => b.Infants).HasDefaultValue(0);

            modelBuilder.Entity<Expense>().Property(b => b.Amount).HasDefaultValue(0.0m);

            modelBuilder.Entity<PushNotificationSubscription>().HasAlternateKey(pns => pns.Endpoint).HasName("AK_Endpoint");

        }
    }
}
