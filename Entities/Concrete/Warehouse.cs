using Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.Concrete
{
    public class Warehouse:ProjectBaseEntity, IEntity
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public string Situation { get; set; }
    }
}
