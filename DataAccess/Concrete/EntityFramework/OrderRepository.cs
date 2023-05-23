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

        public async Task<Order> GetOrder(int productId, int customerId, int quantity, string size, string color)
        {
            var order = await Context.Orders.FirstOrDefaultAsync(x => x.ProductId == productId && x.CustomerId == customerId && x.Quantity == quantity && x.Size == size && x.Color == color && x.isDeleted == false);
            return order;
        }

        public async Task<List<OrderDto>> GetOrderDto()
        {
            var result = await(from o in Context.Orders
                               join p in Context.Products on o.ProductId equals p.Id into op
                               from p in op.DefaultIfEmpty()
                               join c in Context.Customers on o.CustomerId equals c.Id into oc
                               from c in oc.DefaultIfEmpty()
                               where o.isDeleted == false
                               select new OrderDto
                               {
                                   Id = o.Id,
                                   CreatedDate = o.CreatedDate,
                                   LastUpdatedDate = o.LastUpdatedDate,
                                   Status = o.Status,
                                   CreatedUserId = o.CreatedUserId,
                                   LastUpdatedUserId = o.LastUpdatedUserId,
                                   ProductId = p != null ? p.Id : 0,
                                   ProductName = p != null ? p.ProductName : null,
                                   Quantity = o.Quantity,
                                   CustomerId = c !=null ? c.Id : 0,
                                   CustomerName = c != null ? c.CustomerName : null,
                                   Color = o.Color,
                                   Size = o.Size,
                               }
                    ).ToListAsync();
            return result;
        }
    }
}
