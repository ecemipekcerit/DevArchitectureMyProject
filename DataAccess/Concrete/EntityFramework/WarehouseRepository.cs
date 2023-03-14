
using System;
using System.Linq;
using Core.DataAccess.EntityFramework;
using Entities.Concrete;
using DataAccess.Concrete.EntityFramework.Contexts;
using DataAccess.Abstract;
namespace DataAccess.Concrete.EntityFramework
{
    public class WarehouseRepository : EfEntityRepositoryBase<Warehouse, ProjectDbContext>, IWarehouseRepository
    {
        public WarehouseRepository(ProjectDbContext context) : base(context)
        {
        }
    }
}
