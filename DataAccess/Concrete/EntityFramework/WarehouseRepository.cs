using Azure.Core;
using Core.DataAccess.EntityFramework;
using DataAccess.Abstract;
using DataAccess.Concrete.EntityFramework.Contexts;
using Entities.Concrete;
using Entities.Dtos;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;

namespace DataAccess.Concrete.EntityFramework
{
    public class WarehouseRepository : EfEntityRepositoryBase<Warehouse, ProjectDbContext>, IWarehouseRepository
    {
        public WarehouseRepository(ProjectDbContext context) : base(context)
        {
        }

        public async Task<bool> IsExistWarehouse(int productId, int quantity, string size, string color) 
        {
            var isExistWarehouse = await Context.Warehouses.AnyAsync(x => x.ProductId == productId && x.Quantity >= quantity && x.Size == size && x.Color == color && x.isReady == true && x.isDeleted == false);
            return isExistWarehouse;
        }

        public async Task<Warehouse> GetWarehouse(int productId, int quantity, string size, string color)
        {
            var warehouse = await Context.Warehouses.FirstOrDefaultAsync(x => x.ProductId == productId && x.Quantity >= quantity && x.isReady == true && x.Size == size && x.Color == color && x.isDeleted == false);
            return warehouse;
        }

        public async Task<List<WarehouseDto>> GetWarehouseDto()
        {
            var result = await (from w in Context.Warehouses
                                join p in Context.Products on w.ProductId equals p.Id into wp
                                from p in wp.DefaultIfEmpty()
                                where p == null || (!p.isDeleted && !w.isDeleted)
                                select new WarehouseDto
                                {
                                    Id = w.Id,
                                    CreatedUserId = w.CreatedUserId,
                                    CreatedDate = w.CreatedDate,
                                    LastUpdatedDate = w.LastUpdatedDate,
                                    LastUpdatedUserId  = w.LastUpdatedUserId,
                                    Status = w.Status,
                                    ProductId = p != null ? p.Id : 0,
                                    ProductName = p != null ? p.ProductName : null,
                                    Size = w.Size,
                                    Color = w.Color,
                                    Quantity = w.Quantity,
                                    isReady = w.isReady,
                                }
                    ).ToListAsync();
            return result;
        }

        public async Task<List<WarehouseDto>> GetFilterByDate(string startDate, string endDate)
        {
            //startDate ve endDate değerlerini dönüştür
            DateTime startDateTime = DateTime.ParseExact(startDate, "dd.MM.yyyy", CultureInfo.InvariantCulture);
            DateTime endDateTime =  DateTime.ParseExact(endDate, "dd.MM.yyyy", CultureInfo.InvariantCulture).AddDays(1);
            
            // createdDate alanını tarih formatına dönüştür
            var filter = await (from w in Context.Warehouses
                                join p in Context.Products on w.ProductId equals p.Id into wp
                                from p in wp.DefaultIfEmpty()
                                where !p.isDeleted && !w.isDeleted &&
                                     w.CreatedDate >= startDateTime &&
                                     w.CreatedDate <= endDateTime
                                select new WarehouseDto
                                {
                                    Id = w.Id,
                                    CreatedUserId = w.CreatedUserId,
                                    CreatedDate = w.CreatedDate,
                                    LastUpdatedDate = w.LastUpdatedDate,
                                    LastUpdatedUserId = w.LastUpdatedUserId,
                                    Status = w.Status,
                                    ProductId = p.Id,
                                    ProductName = p.ProductName,
                                    Size = w.Size,
                                    Color = w.Color,
                                    Quantity = w.Quantity,
                                    isReady = w.isReady,
                                }
             ).ToListAsync();
            return filter;
        }
    }
}
