using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RentTracker.Core.Entities;
using RentTracker.Core.Interfaces;

namespace RentTracker.Web.Controllers
{
    [Authorize]
    [Route("api/img")]
    [ApiController]
    public class ImagesController : ControllerBase
    {
        private readonly IImageService _imageService;
        public ImagesController(IImageService imageService)
        {
            _imageService = imageService;
        }

        // GET api/image/{id}
        [AllowAnonymous]
        [HttpGet("{id}")]
        public async Task<ActionResult> GetAsync(Guid id)
        {
            var img = await _imageService.GetAsync(id);

            return new FileContentResult(img.Data, img.ContentType);
        }

        // POST api/image
        [HttpPost]
        public async Task<ActionResult> CreateAsync([FromForm] IFormFile image)
        {
            var img = new Image
            {
                UploadTime = DateTime.Now,
                ContentType = image.ContentType
            };

            var ms = new MemoryStream();
            await image.CopyToAsync(ms);

            img.Data = ms.ToArray();

            img = await _imageService.CreateAsync(img);
            var resourceUri = $"{Request.Path}/{img.Id}";

            return Created(resourceUri, new Image { Id = img.Id });
        }

        // PUT api/image/{id}
        [HttpPut("{id}")]
        public async Task<ActionResult<LinkedCalendar>> UpdateAsync(Guid id, [FromForm] IFormFile image)
        {
            var img = new Image
            {
                Id = id,
                UploadTime = DateTime.Now,
                ContentType = image.ContentType
            };

            var ms = new MemoryStream();
            await image.CopyToAsync(ms);

            img.Data = ms.ToArray();

            await _imageService.UpdateAsync(img);

            return Ok();
        }

        // DELETE api/image/{id}
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteAsync(Guid id)
        {
            await _imageService.DeleteAsync(id);

            return Ok();
        }
    }
}
