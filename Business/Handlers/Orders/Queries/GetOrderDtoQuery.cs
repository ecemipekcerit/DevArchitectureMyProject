using Business.BusinessAspects;
using Business.Handlers.Warehouses.Queries;
using Core.Aspects.Autofac.Caching;
using Core.Aspects.Autofac.Logging;
using Core.Aspects.Autofac.Performance;
using Core.CrossCuttingConcerns.Logging.Serilog.Loggers;
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

namespace Business.Handlers.Orders.Queries
{
    public class GetOrderDtoQuery : IRequest<IDataResult<IEnumerable<OrderDto>>>
    {
        public class GetOrderDtoQueryHandler : IRequestHandler<GetOrderDtoQuery, IDataResult<IEnumerable<OrderDto>>>
        {
            private readonly IOrderRepository _orderRepository;
            private readonly IMediator _mediator;

            public GetOrderDtoQueryHandler(IOrderRepository orderRepository, IMediator mediator)
            {
                _orderRepository = orderRepository;
                _mediator = mediator;
            }

            [SecuredOperation(Priority = 1)]
            [PerformanceAspect(5)]
            [CacheAspect(10)]
            [LogAspect(typeof(FileLogger))]
            public async Task<IDataResult<IEnumerable<OrderDto>>> Handle(GetOrderDtoQuery request, CancellationToken cancellationToken)
            {

                return new SuccessDataResult<IEnumerable<OrderDto>>(await _orderRepository.GetOrderDto());
            }
        }
    }
}
