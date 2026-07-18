using Microsoft.EntityFrameworkCore;
using RentTracker.Domain.Entities;

namespace RentTracker.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Apartment> Apartments => Set<Apartment>();
    public DbSet<Reservation> Reservations => Set<Reservation>();
    public DbSet<Expense> Expenses => Set<Expense>();
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<LinkedCalendar> LinkedCalendars => Set<LinkedCalendar>();
    public DbSet<IntegrationConfiguration> IntegrationConfigurations => Set<IntegrationConfiguration>();
    public DbSet<PushNotificationSubscription> PushNotificationSubscriptions => Set<PushNotificationSubscription>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(x => x.GoogleSubject).IsUnique();
            e.HasIndex(x => x.Email).IsUnique();
            e.Property(x => x.Email).HasMaxLength(320);
            e.Property(x => x.GoogleSubject).HasMaxLength(128);
            e.Property(x => x.FirstName).HasMaxLength(100);
            e.Property(x => x.LastName).HasMaxLength(100);
        });

        modelBuilder.Entity<Apartment>(e =>
        {
            e.Property(x => x.Name).HasMaxLength(200).IsRequired();
            e.HasOne(x => x.Owner)
                .WithMany(x => x.Apartments)
                .HasForeignKey(x => x.OwnerId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(x => x.OwnerId);
        });

        modelBuilder.Entity<Reservation>(e =>
        {
            e.Property(x => x.HoldingName).HasMaxLength(200).IsRequired();
            e.Property(x => x.Price).HasPrecision(12, 2);
            e.Property(x => x.Commission).HasPrecision(12, 2);
            e.Property(x => x.Country).HasMaxLength(100);
            e.Property(x => x.ExternalId).HasMaxLength(200);
            e.Property(x => x.Reference).HasMaxLength(200);
            e.HasOne(x => x.Apartment)
                .WithMany(x => x.Reservations)
                .HasForeignKey(x => x.ApartmentId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(x => new { x.ApartmentId, x.StartDate, x.EndDate });
            e.HasIndex(x => new { x.ApartmentId, x.ExternalId });
        });

        modelBuilder.Entity<Expense>(e =>
        {
            e.Property(x => x.Name).HasMaxLength(200).IsRequired();
            e.Property(x => x.Amount).HasPrecision(12, 2);
            e.HasOne(x => x.Apartment)
                .WithMany(x => x.Expenses)
                .HasForeignKey(x => x.ApartmentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Document>(e =>
        {
            e.Property(x => x.Title).HasMaxLength(200).IsRequired();
            e.Property(x => x.FileName).HasMaxLength(260).IsRequired();
            e.Property(x => x.ContentType).HasMaxLength(120).IsRequired();
            e.Property(x => x.BlobKey).HasMaxLength(500).IsRequired();
            e.HasOne(x => x.Apartment)
                .WithMany(x => x.Documents)
                .HasForeignKey(x => x.ApartmentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<LinkedCalendar>(e =>
        {
            e.Property(x => x.Name).HasMaxLength(200).IsRequired();
            e.Property(x => x.Url).HasMaxLength(2000).IsRequired();
            e.HasOne(x => x.Apartment)
                .WithMany(x => x.LinkedCalendars)
                .HasForeignKey(x => x.ApartmentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<IntegrationConfiguration>(e =>
        {
            e.Property(x => x.ExternalPropertyId).HasMaxLength(200);
            e.Property(x => x.IcalUrl).HasMaxLength(2000);
            e.HasOne(x => x.Apartment)
                .WithMany(x => x.IntegrationConfigurations)
                .HasForeignKey(x => x.ApartmentId)
                .OnDelete(DeleteBehavior.Cascade);
            e.HasIndex(x => new { x.ApartmentId, x.Provider }).IsUnique();
        });

        modelBuilder.Entity<PushNotificationSubscription>(e =>
        {
            e.Property(x => x.Endpoint).HasMaxLength(2000).IsRequired();
            e.Property(x => x.P256dh).HasMaxLength(500).IsRequired();
            e.Property(x => x.Auth).HasMaxLength(500).IsRequired();
            e.HasIndex(x => x.Endpoint).IsUnique();
            e.HasOne(x => x.User)
                .WithMany(x => x.PushSubscriptions)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
