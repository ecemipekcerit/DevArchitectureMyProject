using Business.BusinessAspects;
using Core.Aspects.Autofac.Caching;
using Core.Aspects.Autofac.Logging;
using Core.CrossCuttingConcerns.Logging.Serilog.Loggers;
using Core.Utilities.Results;
using DataAccess.Abstract;
using Entities.Concrete;
using Entities.Dtos;
using MediatR;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata.Ecma335;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Business.Handlers.Warehouses.Queries
{
    public class GetFilterByDateQuery : IRequest<IDataResult<IEnumerable<WarehouseDto>>>
    {
        public string StartDate { get; set; }
        public string EndDate { get; set; }

        public class GetFilterByDateQueryHandler : IRequestHandler<GetFilterByDateQuery, IDataResult<IEnumerable<WarehouseDto>>>
        {
            private readonly IWarehouseRepository _warehouseRepository;
            private readonly IMediator _mediator;

            public GetFilterByDateQueryHandler(IWarehouseRepository warehouseRepository, IMediator mediator)
            {
                _warehouseRepository = warehouseRepository;
                _mediator = mediator;
            }

            [SecuredOperation(Priority = 1)]
            [CacheAspect(10)]
            [LogAspect(typeof(FileLogger))]
            public async Task<IDataResult<IEnumerable<WarehouseDto>>> Handle(GetFilterByDateQuery request, CancellationToken cancellationToken)
            {
                return new SuccessDataResult<IEnumerable<WarehouseDto>>(await _warehouseRepository.GetFilterByDate(request.StartDate, request.EndDate));
            }
        }
    }
}

