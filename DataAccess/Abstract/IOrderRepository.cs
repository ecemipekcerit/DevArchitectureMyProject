
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Core.DataAccess;
using Entities.Concrete;
using Entities.Dtos;

namespace DataAccess.Abstract
{
    public interface IOrderRepository : IEntityRepository<Order>
    {
        Task<List<OrderDto>> GetOrderDto();
        Task<Order> GetOrder(int productId, int customerId, int quantity, string size, string color);


    }
}