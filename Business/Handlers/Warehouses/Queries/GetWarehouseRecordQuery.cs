using Amazon.Runtime.Internal;
using Business.BusinessAspects;
using Business.Handlers.Orders.Queries;
using Core.Aspects.Autofac.Caching;
using Core.Aspects.Autofac.Logging;
using Core.Aspects.Autofac.Performance;
using Core.CrossCuttingConcerns.Logging.Serilog.Loggers;
using Core.Utilities.Results;
using DataAccess.Abstract;
using DataAccess.Concrete.EntityFramework;
using Entities.Concrete;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Business.Handlers.Warehouses.Queries
{
    public class GetWarehouseRecordQuery:IRequest<IDataResult<Warehouse>>
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public string Size { get; set; }
        public string Color { get; set; }
        public class GetWarehoseRecordQueryHandler : IRequestHandler<GetWarehouseRecordQuery, IDataResult<Warehouse>>
        {
            private readonly IWarehouseRepository _warehouseRepository;
            private readonly IMediator _mediator;

            public GetWarehoseRecordQueryHandler(IWarehouseRepository warehouseRepository, IMediator mediator)
            {
                _warehouseRepository = warehouseRepository;
                _mediator = mediator;
            }
            [PerformanceAspect(5)]
            [CacheAspect(10)]
            [LogAspect(typeof(FileLogger))]
            public async Task<IDataResult<Warehouse>> Handle(GetWarehouseRecordQuery request, CancellationToken cancellationToken)
            {
                return new SuccessDataResult<Warehouse>(await _warehouseRepository.GetWarehouse(request.ProductId, request.Quantity, request.Size, request.Color));
            }
        }
    }
}
