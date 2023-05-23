
using Business.Constants;
using Business.BusinessAspects;
using Core.Aspects.Autofac.Caching;
using Core.Aspects.Autofac.Logging;
using Core.CrossCuttingConcerns.Logging.Serilog.Loggers;
using Core.Utilities.Results;
using DataAccess.Abstract;
using Entities.Concrete;
using MediatR;
using System.Threading;
using System.Threading.Tasks;
using System.Linq;
using Core.Aspects.Autofac.Validation;
using Business.Handlers.Orders.ValidationRules;
using Business.Handlers.Warehouses.Queries;
using Business.Handlers.Warehouses.Commands;

namespace Business.Handlers.Orders.Commands
{


    public class UpdateOrderCommand : IRequest<IResult>
    {
        public int Id { get; set; }
        public int CreatedUserId { get; set; }
        public int LastUpdatedUserId { get; set; }
        public bool Status { get; set; }
        public bool isDeleted { get; set; }
        public int CustomerId { get; set; }
        public int ProductId { get; set; }
        public string Size { get; set; }
        public string Color { get; set; }
        public int Quantity { get; set; }

        public class UpdateOrderCommandHandler : IRequestHandler<UpdateOrderCommand, IResult>
        {
            private readonly IOrderRepository _orderRepository;
            private readonly IMediator _mediator;

            public UpdateOrderCommandHandler(IOrderRepository orderRepository, IMediator mediator)
            {
                _orderRepository = orderRepository;
                _mediator = mediator;
            }

            [ValidationAspect(typeof(UpdateOrderValidator), Priority = 1)]
            [CacheRemoveAspect("Get")]
            [LogAspect(typeof(FileLogger))]
            [SecuredOperation(Priority = 1)]
            public async Task<IResult> Handle(UpdateOrderCommand request, CancellationToken cancellationToken)
            {
                var isThereOrderRecord = await _orderRepository.GetAsync(u => u.Id == request.Id);

                var isWarehouseRecord = await _mediator.Send(new isExistWarehouseQuery { ProductId = request.ProductId, Quantity = request.Quantity, Size = request.Size, Color = request.Color });

                if (isWarehouseRecord.Data)
                {
                    //varsa depoyu getir
                    var warehouse = await _mediator.Send(new GetWarehouseRecordQuery { ProductId = request.ProductId, Quantity = request.Quantity, Size = request.Size, Color = request.Color });
                    var productQuantity = isThereOrderRecord.Quantity;
                    //depodan siparişteki adet sayısını düşür
                    warehouse.Data.Quantity -= (request.Quantity - productQuantity);
                    //depoyu güncelle
                    var updateWarehouseCommand = await _mediator.Send(new UpdateWarehouseCommand
                    {
                        Id = warehouse.Data.Id,
                        Quantity = warehouse.Data.Quantity,
                        isReady = true,
                        isDeleted = false,
                        CreatedUserId = warehouse.Data.CreatedUserId,
                        LastUpdatedUserId = warehouse.Data.LastUpdatedUserId,
                        LastUpdatedDate = System.DateTime.Now,
                        ProductId = warehouse.Data.ProductId,
                        Status = warehouse.Data.Status,
                        Color = warehouse.Data.Color,
                        Size = warehouse.Data.Size,

                    });
                    //orderı güncelle

                    isThereOrderRecord.CreatedUserId = request.CreatedUserId;
                    isThereOrderRecord.LastUpdatedUserId = request.LastUpdatedUserId;
                    isThereOrderRecord.LastUpdatedDate = System.DateTime.Now;
                    isThereOrderRecord.Status = request.Status;
                    isThereOrderRecord.isDeleted = request.isDeleted;
                    isThereOrderRecord.CustomerId = request.CustomerId;
                    isThereOrderRecord.ProductId = request.ProductId;
                    isThereOrderRecord.Quantity = request.Quantity;
                    isThereOrderRecord.Size = request.Size;
                    isThereOrderRecord.Color = request.Color;


                    _orderRepository.Update(isThereOrderRecord);
                    await _orderRepository.SaveChangesAsync();
                    return new SuccessResult(Messages.Updated);
                }

                else
                {
                    //depo yoksa uyarı bastır
                    return new ErrorResult(Messages.Unknown);

                }
                
            }
        }
    }
}

