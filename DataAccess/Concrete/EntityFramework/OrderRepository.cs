using System;
using System.Linq;
using Core.DataAccess.EntityFramework;
using Entities.Concrete;
using DataAccess.Concrete.EntityFramework.Contexts;
using DataAccess.Abstract;
using Entities.Dtos;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace DataAccess.Concrete.EntityFramework
{
    public class OrderRepository : EfEntityRepositoryBase<Order, ProjectDbContext>, IOrderRepository
    {
        public OrderRepository(ProjectDbContext context) : base(context)
        {
        }

        public async Task<Order> GetOrder(int productId, int customerId, int quantity)
        {
            var order = await Context.Orders.FirstOrDefaultAsync(x => x.ProductId == productId && x.CustomerId == customerId && x.Quantity == quantity && x.isDeleted == false);
            return order;
        }

        public async Task<List<OrderDto>> GetOrderDto()
        {
            var result = await(from o in Context.Orders
                               join p in Context.Products on o.ProductId equals p.Id into op
                               from p in op.DefaultIfEmpty()
                               join c in Context.Customers on o.CustomerId equals c.Id into oc
                               from c in oc.DefaultIfEmpty()
                               where o.isDeleted== false && p.isDeleted == false && c.isDeleted == false
                               select new OrderDto
                               {
                                   Id = o.Id,
                                   CreatedUserId = o.CreatedUserId,
                                   LastUpdatedUserId = o.LastUpdatedUserId,
                                   ProductId = p.Id,
                                   ProductName = p.ProductName,
                                   Quantity = o.Quantity,
                                   CustomerId = c.Id,
                                   CustomerName = c.CustomerName
                               }
                                    ).ToListAsync();
            return result;
        }
    }
}
