
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
        Task<List<WarehouseDto>> GetWarehouseDto();
        Task<Warehouse> GetWarehouse(int productId, int stock);
        Task<bool> IsExistWarehouse(int productId,int quantity);
        //Task<bool> VerifyWarehuse(Warehouse warehouse);
    }
}