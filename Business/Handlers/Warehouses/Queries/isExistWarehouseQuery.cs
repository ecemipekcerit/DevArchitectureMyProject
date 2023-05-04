using Amazon.Runtime.Internal;
using Business.BusinessAspects;
using Business.Constants;
using Core.Aspects.Autofac.Logging;
using Core.CrossCuttingConcerns.Logging.Serilog.Loggers;
using Core.Entities.Dtos;
using Core.Utilities.Results;
using DataAccess.Abstract;
using DataAccess.Concrete.EntityFramework;
using Entities.Concrete;
using MediatR;
using MimeKit.Encodings;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Business.Handlers.Warehouses.Queries
{
    public class isExistWarehouseQuery : IRequest<IDataResult<bool>>
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public class isExistWarehouseQueryHandler : IRequestHandler<isExistWarehouseQuery, IDataResult<bool>>
        {
            private readonly IWarehouseRepository _warehouseRepository;
            private readonly IMediator _mediator;

            public isExistWarehouseQueryHandler(IWarehouseRepository warehouseRepository, IMediator mediator)
            {
                _warehouseRepository = warehouseRepository;
                _mediator = mediator;
            }
            [LogAspect(typeof(FileLogger))]
            //[SecuredOperation(Priority = 1)]
            public async Task<IDataResult<bool>> Handle(isExistWarehouseQuery request, CancellationToken cancellationToken)
            {
              return new SuccessDataResult<bool>(await _warehouseRepository.IsExistWarehouse(request.ProductId,request.Quantity));
            }
        }
    }
}
