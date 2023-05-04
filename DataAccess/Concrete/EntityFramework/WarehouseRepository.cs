using Core.DataAccess.EntityFramework;
using DataAccess.Abstract;
using DataAccess.Concrete.EntityFramework.Contexts;
using Entities.Concrete;
using Entities.Dtos;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace DataAccess.Concrete.EntityFramework
{
    public class WarehouseRepository : EfEntityRepositoryBase<Warehouse, ProjectDbContext>, IWarehouseRepository
    {
        public WarehouseRepository(ProjectDbContext context) : base(context)
        {
        }

        public async Task<bool> IsExistWarehouse(int productId, int quantity)
        {
            var isExistWarehouse = await Context.Warehouses.AnyAsync(x => x.ProductId == productId && x.Stock >= quantity && x.isReady == true && x.isDeleted == false);
            return isExistWarehouse;
        }

        public async Task<Warehouse> GetWarehouse(int productId, int stock)
        {
            var warehouse = await Context.Warehouses.FirstOrDefaultAsync(x => x.ProductId == productId && x.Stock >= stock && x.isReady == true && x.isDeleted == false);
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
                                    Stock = w.Stock,
                                    isReady = w.isReady,
                                }
                    ).ToListAsync();
            return result;


            //var result = await (from w in Context.Warehouses
            //                    join p in Context.Products on w.ProductId equals p.Id
            //                    where !p.isDeleted && !w.isDeleted
            //                    select new WarehouseDto
            //                    {
            //                        ProductId = p.Id,
            //                        ProductName = p.ProductName,
            //                        Stock = w.Stock,
            //                        isReady = w.isReady,
            //                    }
            //                    ).ToListAsync();


            //return result;
        }

        //public List<Warehouse> WareHouseListProduct()
        //{
        //    MsDbContext d = new MsDbContext();
        //    var warehouse = d.Warehouses.Include(x => x.Product).ToList();
        //    List<Warehouse> list = new List<Warehouse>();
        //    foreach (var i in warehouse)
        //    {
        //        list.Add(i);
        //    }
        //    return warehouse;
        //}

        //public Task<bool> VerifyWarehuse(Warehouse warehouse)
        //{
        //    return (warehouse);
        //}
    }
}
