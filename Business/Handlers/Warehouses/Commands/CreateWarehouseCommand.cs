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
using Business.Handlers.Warehouses.ValidationRules;

namespace Business.Handlers.Warehouses.Commands
{
    /// <summary>
    /// 
    /// </summary>
    public class CreateWarehouseCommand : IRequest<IResult>
    {

        public int CreatedUserId { get; set; }
        public int LastUpdatedUserId { get; set; }
        public bool Status { get; set; }
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public bool isReady { get; set; }
        public string Color { get; set; }
        public string Size { get; set; }


        public class CreateWarehouseCommandHandler : IRequestHandler<CreateWarehouseCommand, IResult>
        {
            private readonly IWarehouseRepository _warehouseRepository;
            private readonly IMediator _mediator;
            public CreateWarehouseCommandHandler(IWarehouseRepository warehouseRepository, IMediator mediator)
            {
                _warehouseRepository = warehouseRepository;
                _mediator = mediator;
            }

            [ValidationAspect(typeof(CreateWarehouseValidator), Priority = 1)]
            [CacheRemoveAspect("Get")]
            [LogAspect(typeof(FileLogger))]
            [SecuredOperation(Priority = 1)]
            public async Task<IResult> Handle(CreateWarehouseCommand request, CancellationToken cancellationToken)
            {
                var isThereWarehouseRecord = _warehouseRepository.Query().Any(u => u.ProductId == request.ProductId && u.Color == request.Color && u.Size == request.Size && u.isReady == request.isReady && u.isDeleted == false);

                if (isThereWarehouseRecord == true)
                {
                    return new ErrorResult(Messages.NameAlreadyExist);
                }
                else
                {
                    var addedWarehouse = new Warehouse
                    {
                        CreatedUserId = request.CreatedUserId,
                        LastUpdatedUserId = request.LastUpdatedUserId,
                        Status = request.Status,
                        ProductId = request.ProductId,
                        Quantity = request.Quantity,
                        isReady = request.isReady,
                        Size = request.Size,
                        Color = request.Color,

                    };

                    _warehouseRepository.Add(addedWarehouse);
                    await _warehouseRepository.SaveChangesAsync();
                    return new SuccessResult(Messages.Added);

                }
            }
        }
    }
}