
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
using Business.Handlers.Customers.ValidationRules;

namespace Business.Handlers.Customers.Commands
{
    /// <summary>
    /// 
    /// </summary>
    public class CreateCustomerCommand : IRequest<IResult>
    {

        public int CreatedUserId { get; set; }
        public int LastUpdatedUserId { get; set; }
        public bool Status { get; set; }
        public string CustomerName { get; set; }
        public string CustomerCode { get; set; }
        public string CustomerAddress { get; set; }
        public string CustomerPhone { get; set; }
        public string CustomerMail { get; set; }


        public class CreateCustomerCommandHandler : IRequestHandler<CreateCustomerCommand, IResult>
        {
            private readonly ICustomerRepository _customerRepository;
            private readonly IMediator _mediator;
            public CreateCustomerCommandHandler(ICustomerRepository customerRepository, IMediator mediator)
            {
                _customerRepository = customerRepository;
                _mediator = mediator;
            }

            [ValidationAspect(typeof(CreateCustomerValidator), Priority = 1)]
            [CacheRemoveAspect("Get")]
            [LogAspect(typeof(FileLogger))]
            [SecuredOperation(Priority = 1)]
            public async Task<IResult> Handle(CreateCustomerCommand request, CancellationToken cancellationToken)
            {
                var isThereCustomerRecord = _customerRepository.Query().Any(u => u.CustomerName == request.CustomerName && u.CustomerCode == request.CustomerCode && u.CustomerMail == request.CustomerMail && u.CustomerPhone == request.CustomerPhone && u.CustomerAddress == request.CustomerAddress && u.isDeleted == false);

                if (isThereCustomerRecord == true)
                { 
                    return new ErrorResult(Messages.NameAlreadyExist); 
                }
                else
                {
                    var addedCustomer = new Customer
                    {
                        CreatedUserId = request.CreatedUserId,
                        LastUpdatedUserId = request.LastUpdatedUserId,
                        Status = request.Status,
                        CustomerName = request.CustomerName,
                        CustomerCode = request.CustomerCode,
                        CustomerAddress = request.CustomerAddress,
                        CustomerPhone = request.CustomerPhone,
                        CustomerMail = request.CustomerMail,

                    };

                    _customerRepository.Add(addedCustomer);
                    await _customerRepository.SaveChangesAsync();
                    return new SuccessResult(Messages.Added);

                }

                
            }
        }
    }
}