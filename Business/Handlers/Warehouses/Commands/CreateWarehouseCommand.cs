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
        public bool isDeleted { get; set; }
        public int ProductId { get; set; }
        public int Stock { get; set; }
        public bool isReady { get; set; }


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
                var isThereWarehouseRecord = _warehouseRepository.Query().Any(u => u.ProductId == request.ProductId && u.Stock ==request.Stock && u.isReady == request.isReady && u.isDeleted == false);

                if (isThereWarehouseRecord == true)
                {
                    return new ErrorResult(Messages.NameAlreadyExist);
                }
                else
                {
                    var addedWarehouse = new Warehouse
                    {
                        CreatedUserId = request.CreatedUserId,
                        CreatedDate = System.DateTime.Now,
                        LastUpdatedUserId = request.LastUpdatedUserId,
                        LastUpdatedDate = System.DateTime.Now,
                        Status = request.Status,
                        isDeleted = false,
                        ProductId = request.ProductId,
                        Stock = request.Stock,
                        isReady = request.isReady,

                    };

                    _warehouseRepository.Add(addedWarehouse);
                    await _warehouseRepository.SaveChangesAsync();
                    return new SuccessResult(Messages.Added);

                }
            }
        }
    }
}