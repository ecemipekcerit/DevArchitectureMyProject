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
using Business.Handlers.Products.ValidationRules;


namespace Business.Handlers.Products.Commands
{


    public class UpdateProductCommand : IRequest<IResult>
    {
        public int Id { get; set; }
        public int CreatedUserId { get; set; }
        public int LastUpdatedUserId { get; set; }
        public bool Status { get; set; }
        public bool isDeleted { get; set; }
        public string ProductName { get; set; }
        public string Color { get; set; }
        public string Size { get; set; }

        public class UpdateProductCommandHandler : IRequestHandler<UpdateProductCommand, IResult>
        {
            private readonly IProductRepository _productRepository;
            private readonly IMediator _mediator;

            public UpdateProductCommandHandler(IProductRepository productRepository, IMediator mediator)
            {
                _productRepository = productRepository;
                _mediator = mediator;
            }

            [ValidationAspect(typeof(UpdateProductValidator), Priority = 1)]
            [CacheRemoveAspect("Get")]
            [LogAspect(typeof(FileLogger))]
            [SecuredOperation(Priority = 1)]
            public async Task<IResult> Handle(UpdateProductCommand request, CancellationToken cancellationToken)
            {
                var isThereProductRecord = _productRepository.Query().Any(u => u.ProductName == request.ProductName && u.Color == request.Color && u.Size == request.Size && u.isDeleted == false);

                if (isThereProductRecord == true )
                {
                    return new ErrorResult(Messages.NameAlreadyExist);
                }
                else
                {
                    var ProductRecord = await _productRepository.GetAsync(x => x.Id == request.Id);
                    
                    ProductRecord.CreatedUserId = request.CreatedUserId;
                    ProductRecord.LastUpdatedUserId = request.LastUpdatedUserId;
                    ProductRecord.LastUpdatedDate = System.DateTime.Now;
                    ProductRecord.Status = request.Status;
                    ProductRecord.isDeleted = request.isDeleted;
                    ProductRecord.ProductName = request.ProductName;
                    ProductRecord.Color = request.Color;
                    ProductRecord.Size = request.Size;


                    _productRepository.Update(ProductRecord);
                    await _productRepository.SaveChangesAsync();
                    return new SuccessResult(Messages.Updated);
                }

                
            }
        }
    }
}

