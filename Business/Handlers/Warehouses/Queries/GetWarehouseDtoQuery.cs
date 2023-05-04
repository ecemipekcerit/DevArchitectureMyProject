using Business.BusinessAspects;
using Core.Aspects.Autofac.Caching;
using Core.Aspects.Autofac.Logging;
using Core.Aspects.Autofac.Performance;
using Core.CrossCuttingConcerns.Logging.Serilog.Loggers;
using Core.Entities.Dtos;
using Core.Utilities.Results;
using DataAccess.Abstract;
using Entities.Dtos;
using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Business.Handlers.Warehouses.Queries
{
    public class GetWarehouseDtoQuery : IRequest<IDataResult<IEnumerable<WarehouseDto>>>
    {
        public class GetWarehouseDtoQueryHandler : IRequestHandler<GetWarehouseDtoQuery, IDataResult<IEnumerable<WarehouseDto>>>
        {
            private readonly IWarehouseRepository _warehouseRepository;
            private readonly IMediator _mediator;

            public GetWarehouseDtoQueryHandler(IWarehouseRepository warehouseRepository, IMediator mediator)
            {
                _warehouseRepository = warehouseRepository;
                _mediator = mediator;
            }

            [SecuredOperation(Priority = 1)]
            [CacheAspect(10)]
            [LogAspect(typeof(FileLogger))]
            public async Task<IDataResult<IEnumerable<WarehouseDto>>> Handle(GetWarehouseDtoQuery request, CancellationToken cancellationToken)
            {

                return new SuccessDataResult<IEnumerable<WarehouseDto>>(await _warehouseRepository.GetWarehouseDto());
            }
        }
    }
}
