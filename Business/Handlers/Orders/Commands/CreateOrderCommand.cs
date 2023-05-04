
using Business.BusinessAspects;
using Business.Constants;
using Core.Aspects.Autofac.Caching;
using Core.Aspects.Autofac.Logging;
using Core.Aspects.Autofac.Validation;
using Core.CrossCuttingConcerns.Logging.Serilog.Loggers;
using Core.Utilities.Results;
using DataAccess.Abstract;
using Entities.Concrete;
using MediatR;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;
using Business.Handlers.Orders.ValidationRules;
using Business.Handlers.Warehouses.Queries;
using System;
using Business.Handlers.Warehouses.Commands;

namespace Business.Handlers.Orders.Commands
{
    /// <summary>
    /// 
    /// </summary>
    public class CreateOrderCommand : IRequest<IResult>
    {
        public int CreatedUserId { get; set; }
        public int LastUpdatedUserId { get; set; }
        public bool Status { get; set; }
        public bool isDeleted { get; set; }
        public int CustomerId { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }


        public class CreateOrderCommandHandler : IRequestHandler<CreateOrderCommand, IResult>
        {
            private readonly IOrderRepository _orderRepository;
            private readonly IMediator _mediator;
            public CreateOrderCommandHandler(IOrderRepository orderRepository, IMediator mediator)
            {
                _orderRepository = orderRepository;
                _mediator = mediator;
            }

            [ValidationAspect(typeof(CreateOrderValidator), Priority = 1)]
            [CacheRemoveAspect("Get")]
            [LogAspect(typeof(FileLogger))]
            [SecuredOperation(Priority = 1)]
            public async Task<IResult> Handle(CreateOrderCommand request, CancellationToken cancellationToken)
            {
                var isThereOrderRecord = _orderRepository.Query().Any(u => u.ProductId == request.ProductId && u.Quantity == request.Quantity && u.CustomerId == request.CustomerId && u.isDeleted == false);
                if (isThereOrderRecord == true)
                {
                    return new ErrorResult(Messages.NameAlreadyExist);
                }
                else
                {
                    //depo var mı yok mu
                    var isWarehouseRecord = await _mediator.Send(new isExistWarehouseQuery { ProductId = request.ProductId, Quantity = request.Quantity });

                    if (isWarehouseRecord != null)
                    {
                        //varsa depoyu getir
                        var warehouse = await _mediator.Send(new GetWarehouseRecordQuery { ProductId = request.ProductId, Stock = request.Quantity });
                        //depodan siparişteki adet sayısını düşür
                        warehouse.Data.Stock -= request.Quantity;
                        //depoyu güncelle
                        var updateWarehouseCommand = await _mediator.Send(new UpdateWarehouseCommand
                        {
                            Id = warehouse.Data.Id,
                            Stock = warehouse.Data.Stock,
                            isReady = true,
                            isDeleted = false,
                            CreatedUserId = warehouse.Data.CreatedUserId,
                            LastUpdatedUserId = warehouse.Data.LastUpdatedUserId,
                            ProductId = warehouse.Data.ProductId,
                            Status = warehouse.Data.Status
                        });
                        //order kaydet
                        var addedOrder = new Order
                        {
                            CreatedUserId = request.CreatedUserId,
                            CreatedDate = System.DateTime.Now,
                            LastUpdatedUserId = request.LastUpdatedUserId,
                            LastUpdatedDate = System.DateTime.Now,
                            Status = request.Status,
                            isDeleted = false,
                            ProductId = request.ProductId,
                            Quantity = request.Quantity,
                            CustomerId = request.CustomerId,

                        };

                        _orderRepository.Add(addedOrder);
                        await _orderRepository.SaveChangesAsync();
                        
                    }

                    else
                    {
                        //depo yoksa uyarı bastır
                        return new ErrorResult(Messages.Unknown);

                    }

                }
                return new SuccessResult(Messages.Added);
            }

        }

    }
}
