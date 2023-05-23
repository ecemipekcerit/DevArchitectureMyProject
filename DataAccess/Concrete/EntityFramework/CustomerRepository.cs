
using System;
using System.Linq;
using Core.DataAccess.EntityFramework;
using Entities.Concrete;
using DataAccess.Concrete.EntityFramework.Contexts;
using DataAccess.Abstract;
using Core.Entities.Dtos;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace DataAccess.Concrete.EntityFramework
{
    public class CustomerRepository : EfEntityRepositoryBase<Customer, ProjectDbContext>, ICustomerRepository
    {
        public CustomerRepository(ProjectDbContext context) : base(context)
        {
        }
        public async Task<List<SelectionItem>> GetCustomersLookUp()
        {
            var lookUp = await (from entity in Context.Customers
                                select new SelectionItem()
                                {
                                    Id = entity.Id,
                                    Label = entity.CustomerName
                                }).ToListAsync();
            return lookUp;
        }
        //public async Task<List<SelectionItem>> GetCustomerLookUpWithCode()
        //{
        //    var lookUp = await (from entity in Context.Customers
        //                        select new SelectionItem()
        //                        {
        //                            Id = entity.CustomerCode.ToString(),
        //                            Label = entity.CustomerCode
        //                        }).ToListAsync();
        //    return lookUp;
        //}
    }
}
