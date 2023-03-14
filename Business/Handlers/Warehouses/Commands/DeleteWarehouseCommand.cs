
using Business.Constants;
using Core.Aspects.Autofac.Caching;
using Business.BusinessAspects;
using Core.Aspects.Autofac.Logging;
using Core.CrossCuttingConcerns.Logging.Serilog.Loggers;
using Core.Utilities.Results;
using DataAccess.Abstract;
using MediatR;
using System.Threading;
using System.Threading.Tasks;


namespace Business.Handlers.Warehouses.Commands
{
    /// <summary>
    /// 
    /// </summary>
    public class DeleteWarehouseCommand : IRequest<IResult>
    {
        public int Id { get; set; }

        public class DeleteWarehouseCommandHandler : IRequestHandler<DeleteWarehouseCommand, IResult>
        {
            private readonly IWarehouseRepository _warehouseRepository;
            private readonly IMediator _mediator;

            public DeleteWarehouseCommandHandler(IWarehouseRepository warehouseRepository, IMediator mediator)
            {
                _warehouseRepository = warehouseRepository;
                _mediator = mediator;
            }

            [CacheRemoveAspect("Get")]
            [LogAspect(typeof(FileLogger))]
            [SecuredOperation(Priority = 1)]
            public async Task<IResult> Handle(DeleteWarehouseCommand request, CancellationToken cancellationToken)
            {
                var warehouseToDelete = _warehouseRepository.Get(p => p.Id == request.Id);
                warehouseToDelete.isDeleted = true;
                _warehouseRepository.Update(warehouseToDelete);
                await _warehouseRepository.SaveChangesAsync();
                return new SuccessResult(Messages.Deleted);
            }
        }
    }
}

