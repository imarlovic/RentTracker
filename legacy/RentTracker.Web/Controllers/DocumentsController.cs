using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RentTracker.Core.Entities;
using RentTracker.Data.Interfaces;

namespace RentTracker.Web.Controllers
{
    [Authorize]
    [Route("api/documents")]
    [ApiController]
    public class DocumentsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;
        public DocumentsController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // GET api/image/{id}
        [HttpGet("{id}")]
        public async Task<ActionResult> GetAsync(Guid id)
        {
            var document = await _unitOfWork.Repository<Document>().Get(id);

            if (document == null) return NotFound();

            return File(document.Blob, document.MimeType, $"{document.FileName}{document.FileExtension}");
        }
    }
}
