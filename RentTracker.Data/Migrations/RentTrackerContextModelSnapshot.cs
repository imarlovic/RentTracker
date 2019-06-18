﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using RentTracker.Data;

namespace RentTracker.Data.Migrations
{
    [DbContext(typeof(RentTrackerContext))]
    partial class RentTrackerContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "2.2.4-servicing-10062")
                .HasAnnotation("Relational:MaxIdentifierLength", 128)
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("RentTracker.Core.Entities.Apartment", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<Guid?>("HeaderId");

                    b.Property<string>("Name");

                    b.Property<Guid>("OwnerId");

                    b.HasKey("Id");

                    b.HasIndex("HeaderId");

                    b.HasIndex("OwnerId");

                    b.ToTable("Apartments");
                });

            modelBuilder.Entity("RentTracker.Core.Entities.Claim", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Issuer");

                    b.Property<string>("OriginalIssuer");

                    b.Property<string>("Subject");

                    b.Property<string>("Type");

                    b.Property<Guid>("UserId");

                    b.Property<string>("Value");

                    b.Property<string>("ValueType");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("Claims");
                });

            modelBuilder.Entity("RentTracker.Core.Entities.Document", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<Guid>("ApartmentId");

                    b.Property<byte[]>("Blob")
                        .IsRequired();

                    b.Property<string>("FileExtension")
                        .IsRequired();

                    b.Property<string>("FileName")
                        .IsRequired();

                    b.Property<string>("MimeType")
                        .IsRequired();

                    b.Property<string>("Title")
                        .IsRequired();

                    b.Property<DateTime>("UploadTime");

                    b.HasKey("Id");

                    b.HasIndex("ApartmentId");

                    b.ToTable("Documents");
                });

            modelBuilder.Entity("RentTracker.Core.Entities.Expense", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<decimal>("Amount")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("decimal(9, 2)")
                        .HasDefaultValue(0.0m);

                    b.Property<Guid>("ApartmentId");

                    b.Property<int>("Currency");

                    b.Property<DateTime>("Date");

                    b.Property<string>("Description");

                    b.Property<string>("Name");

                    b.HasKey("Id");

                    b.HasIndex("ApartmentId");

                    b.ToTable("Expenses");
                });

            modelBuilder.Entity("RentTracker.Core.Entities.Image", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("ContentType");

                    b.Property<byte[]>("Data");

                    b.Property<DateTime>("UploadTime");

                    b.HasKey("Id");

                    b.ToTable("Images");
                });

            modelBuilder.Entity("RentTracker.Core.Entities.IntegrationConfiguration", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<Guid>("ApartmentId");

                    b.Property<DateTime>("LastUpdated");

                    b.Property<string>("Password");

                    b.Property<string>("PropertyId");

                    b.Property<int>("Provider");

                    b.Property<string>("StateJson");

                    b.Property<int>("Status");

                    b.Property<string>("Username");

                    b.HasKey("Id");

                    b.HasIndex("ApartmentId");

                    b.ToTable("IntegrationConfigurations");
                });

            modelBuilder.Entity("RentTracker.Core.Entities.LinkedCalendar", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<Guid>("ApartmentId");

                    b.Property<DateTime?>("LastUpdated");

                    b.Property<string>("Name")
                        .IsRequired();

                    b.Property<string>("Url")
                        .IsRequired();

                    b.HasKey("Id");

                    b.HasIndex("ApartmentId");

                    b.ToTable("LinkedCalendars");
                });

            modelBuilder.Entity("RentTracker.Core.Entities.PushNotificationSubscription", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Auth")
                        .IsRequired();

                    b.Property<string>("Endpoint")
                        .IsRequired();

                    b.Property<string>("P256DH")
                        .IsRequired();

                    b.Property<Guid>("UserId");

                    b.HasKey("Id");

                    b.HasAlternateKey("Endpoint")
                        .HasName("AK_Endpoint");

                    b.HasIndex("UserId");

                    b.ToTable("PushNotificationSubscriptions");
                });

            modelBuilder.Entity("RentTracker.Core.Entities.Reservation", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<int?>("Adults")
                        .ValueGeneratedOnAdd()
                        .HasDefaultValue(0);

                    b.Property<Guid>("ApartmentId");

                    b.Property<DateTime?>("BookingDate");

                    b.Property<int?>("Children")
                        .ValueGeneratedOnAdd()
                        .HasDefaultValue(0);

                    b.Property<decimal?>("Commission")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("decimal(9, 2)")
                        .HasDefaultValue(0.0m);

                    b.Property<string>("Country");

                    b.Property<int>("Currency");

                    b.Property<DateTime>("EndDate");

                    b.Property<string>("ExternalId");

                    b.Property<string>("HoldingName")
                        .IsRequired();

                    b.Property<int?>("Infants")
                        .ValueGeneratedOnAdd()
                        .HasDefaultValue(0);

                    b.Property<int?>("People")
                        .ValueGeneratedOnAdd()
                        .HasDefaultValue(0);

                    b.Property<decimal?>("Price")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("decimal(9, 2)")
                        .HasDefaultValue(0.0m);

                    b.Property<string>("Reference");

                    b.Property<int>("Source");

                    b.Property<DateTime>("StartDate");

                    b.Property<int?>("State");

                    b.HasKey("Id");

                    b.HasIndex("ApartmentId");

                    b.ToTable("Reservations");
                });

            modelBuilder.Entity("RentTracker.Core.Entities.User", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Email")
                        .IsRequired();

                    b.Property<string>("ExternalId");

                    b.Property<string>("ExternalProvider");

                    b.Property<string>("FirstName")
                        .IsRequired();

                    b.Property<string>("LastName")
                        .IsRequired();

                    b.Property<string>("Password")
                        .IsRequired();

                    b.Property<string>("UserName")
                        .IsRequired();

                    b.HasKey("Id");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("RentTracker.Core.Entities.Apartment", b =>
                {
                    b.HasOne("RentTracker.Core.Entities.Image", "Header")
                        .WithMany()
                        .HasForeignKey("HeaderId");

                    b.HasOne("RentTracker.Core.Entities.User", "Owner")
                        .WithMany()
                        .HasForeignKey("OwnerId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("RentTracker.Core.Entities.Claim", b =>
                {
                    b.HasOne("RentTracker.Core.Entities.User")
                        .WithMany("Claims")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("RentTracker.Core.Entities.Document", b =>
                {
                    b.HasOne("RentTracker.Core.Entities.Apartment", "Apartment")
                        .WithMany()
                        .HasForeignKey("ApartmentId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("RentTracker.Core.Entities.Expense", b =>
                {
                    b.HasOne("RentTracker.Core.Entities.Apartment", "Apartment")
                        .WithMany()
                        .HasForeignKey("ApartmentId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("RentTracker.Core.Entities.IntegrationConfiguration", b =>
                {
                    b.HasOne("RentTracker.Core.Entities.Apartment", "Apartment")
                        .WithMany()
                        .HasForeignKey("ApartmentId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("RentTracker.Core.Entities.LinkedCalendar", b =>
                {
                    b.HasOne("RentTracker.Core.Entities.Apartment", "Apartment")
                        .WithMany()
                        .HasForeignKey("ApartmentId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("RentTracker.Core.Entities.PushNotificationSubscription", b =>
                {
                    b.HasOne("RentTracker.Core.Entities.User", "User")
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade);
                });

            modelBuilder.Entity("RentTracker.Core.Entities.Reservation", b =>
                {
                    b.HasOne("RentTracker.Core.Entities.Apartment", "Apartment")
                        .WithMany()
                        .HasForeignKey("ApartmentId")
                        .OnDelete(DeleteBehavior.Cascade);
                });
#pragma warning restore 612, 618
        }
    }
}
