using Core.Entities;
using ServiceStack.DataAnnotations;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.Concrete
{
    public class Warehouse:ProjectBaseEntity, IEntity
    {
        //[System.ComponentModel.DataAnnotations.Schema.ForeignKey("Product")]
        public int ProductId { get; set; }
        public int Stock { get; set; }
        public bool isReady { get; set; }
        //public Product Product { get; set; }
    }
}
