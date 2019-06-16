using CryptoHelper;
using RentTracker.Core.Entities;
using RentTracker.Data.Interfaces;
using System;
using System.Linq;
using System.Threading.Tasks;

namespace RentTracker.Data.Initialization
{
    public class TestDatabaseInitialization
    {
        public IUnitOfWork UnitOfWork { get; set; }

        public TestDatabaseInitialization(IUnitOfWork unitOfWork)
        {
            UnitOfWork = unitOfWork;
        }
        public async Task PerformInitialization()
        {
            #region Users

            var testUser = (await UnitOfWork.Repository<User>().Get()).SingleOrDefault(u => u.UserName == "imarlovic");

            if (testUser == null)
            {
                testUser = new User
                {
                    FirstName = "Ivan",
                    LastName = "Marlović",

                    UserName = "imarlovic",
                    Email = "imarlovic@outlook.com",
                    Password = Crypto.HashPassword("imarlovic"),
                };

                await UnitOfWork.Repository<User>().Add(testUser);
            }
            else
            {
                testUser.FirstName = "Ivan";
                testUser.LastName = "Marlović";

                testUser.UserName = "imarlovic";
                testUser.Email = "imarlovic@outlook.com";
                testUser.Password = Crypto.HashPassword("imarlovic");

                await UnitOfWork.Repository<User>().Update(testUser);
            }

            await UnitOfWork.SaveAsync();

            #endregion

            #region Apartments

            var existingApartments = (await UnitOfWork.Repository<Apartment>().Get()).ToArray();
            Apartment testApartment = existingApartments.FirstOrDefault();

            if (testApartment == null)
            {
                testApartment = new Apartment
                {
                    Name = "Apartman Luna",
                    Owner = testUser
                };

                await UnitOfWork.Repository<Apartment>().Add(testApartment);
                await UnitOfWork.SaveAsync();
            }

            #endregion

            #region Reservations

            var existingReservations = (await UnitOfWork.Repository<Reservation>().Get()).ToArray();
            Reservation testReservation = existingReservations.FirstOrDefault();

            if (testReservation == null)
            {
                testReservation = new Reservation
                {
                    Apartment = testApartment,
                    HoldingName = "Pero Perić",
                    Price = 350m,
                    Reference = "AC509A5",
                    Source = Source.RentTracker,
                    StartDate = new DateTime(2019, 5, 6, 0, 0, 0, DateTimeKind.Local),
                    EndDate = new DateTime(2019, 5, 7, 0, 0, 0, DateTimeKind.Local)
                };

                await UnitOfWork.Repository<Reservation>().Add(testReservation);
                await UnitOfWork.SaveAsync();
            };
        }

        #endregion
    }
}
