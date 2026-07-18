using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentTracker.Core.Entities;
using RentTracker.Core.Specifications.Apartment;
using RentTracker.Data.Interfaces;

namespace RentTracker.Web.Controllers
{
    [Authorize]
    [Route("api/reservations")]
    [ApiController]
    public class ReservationsController : ControllerBase
    {
        private readonly IUnitOfWork UnitOfWork;
        public ReservationsController(IUnitOfWork unitOfWork)
        {
            UnitOfWork = unitOfWork;
        }

    }
}
