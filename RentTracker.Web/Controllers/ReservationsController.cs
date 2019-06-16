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

        // GET api/apartments
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Apartment>>> Get()
        {
            var ownerId = Guid.Parse("B9EF479C-B8AE-44D4-AD47-08D6D6407010");
            var specification = new OwnedApartmentsSpecification(ownerId);

            var apartments = await UnitOfWork.Repository<Apartment>().FindBySpecification(specification);

            return Ok(apartments);
        }

        // GET api/values/5
        [HttpGet("{id}")]
        public ActionResult<string> Get(int id)
        {
            return "value";
        }

        // POST api/values
        [HttpPost]
        public void Post([FromBody] string value)
        {
        }

        // PUT api/values/5
        [HttpPut("{id}")]
        public void Put(int id, [FromBody] string value)
        {
        }

        // DELETE api/values/5
        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
