using Ical.Net;
using RentTracker.Core.Entities;
using RentTracker.Core.Interfaces;
using RentTracker.Core.Specifications.LinkedCalendar;
using RentTracker.Core.Specifications.Reservation;
using RentTracker.Data.Interfaces;
using RentTracker.Service.Utilities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;

namespace RentTracker.Service
{
    public class ImageService : IImageService
    {
        readonly IUnitOfWork UnitOfWork;
        
        public ImageService(IUnitOfWork unitOfWork)
        {
            UnitOfWork = unitOfWork;
        }

        public async Task<Image> GetAsync(Guid id)
        {
            var img = await UnitOfWork.Repository<Image>().Get(id);

            return img;
        }
        public Task<IEnumerable<Image>> GetAsync(ISpecification<Image> specification)
        {
            throw new NotImplementedException();
        }
        public async Task<Image> CreateAsync(Image entity)
        {
            await UnitOfWork.Repository<Image>().Add(entity);
            await UnitOfWork.SaveAsync();

            return entity;
        }
        public async Task<Image> UpdateAsync(Image entity)
        {
            var img = await UnitOfWork.Repository<Image>().Get(entity.Id);

            img.Data = entity.Data;
            img.ContentType = entity.ContentType;

            await UnitOfWork.Repository<Image>().Update(img);
            await UnitOfWork.SaveAsync();

            return entity;
        }
        public async Task DeleteAsync(Guid id)
        {
            var entity = await UnitOfWork.Repository<Image>().Get(id);

            await UnitOfWork.Repository<Image>().Delete(entity);
            await UnitOfWork.SaveAsync();
        }
    }
}
