
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.DataAccess;
using Core.Entities.Dtos;
using Entities.Concrete;
using Entities.Dtos;

namespace DataAccess.Abstract
{
    public interface IWarehouseRepository : IEntityRepository<Warehouse>
    {
        Task<Warehouse> GetWarehouse(int productId, int quantity, string size, string color);
        Task<List<WarehouseDto>> GetFilterByDate(string startDate, string endDate);
        Task<List<WarehouseDto>> GetWarehouseDto();
        Task<bool> IsExistWarehouse(int productId,int quantity, string size, string color);
    }
}