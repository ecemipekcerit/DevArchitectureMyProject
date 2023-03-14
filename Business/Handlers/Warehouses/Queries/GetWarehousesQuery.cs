
using Business.BusinessAspects;
using Core.Aspects.Autofac.Performance;
using Core.Utilities.Results;
using DataAccess.Abstract;
using Entities.Concrete;
using MediatR;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Core.Aspects.Autofac.Logging;
using Core.CrossCuttingConcerns.Logging.Serilog.Loggers;
using Core.Aspects.Autofac.Caching;

namespace Business.Handlers.Warehouses.Queries
{

    public class GetWarehousesQuery : IRequest<IDataResult<IEnumerable<Warehouse>>>
    {
        public class GetWarehousesQueryHandler : IRequestHandler<GetWarehousesQuery, IDataResult<IEnumerable<Warehouse>>>
        {
            private readonly IWarehouseRepository _warehouseRepository;
            private readonly IMediator _mediator;

            public GetWarehousesQueryHandler(IWarehouseRepository warehouseRepository, IMediator mediator)
            {
                _warehouseRepository = warehouseRepository;
                _mediator = mediator;
            }

            [PerformanceAspect(5)]
            [CacheAspect(10)]
            [LogAspect(typeof(FileLogger))]
            [SecuredOperation(Priority = 1)]
            public async Task<IDataResult<IEnumerable<Warehouse>>> Handle(GetWarehousesQuery request, CancellationToken cancellationToken)
            {
                return new SuccessDataResult<IEnumerable<Warehouse>>(await _warehouseRepository.GetListAsync(x => x.isDeleted == false));
            }
        }
    }
}