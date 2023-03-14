
using Business.Handlers.Customers.Commands;
using FluentValidation;

namespace Business.Handlers.Customers.ValidationRules
{

    public class CreateCustomerValidator : AbstractValidator<CreateCustomerCommand>
    {
        public CreateCustomerValidator()
        {
            RuleFor(x => x.CustomerCode).NotEmpty();
            RuleFor(x => x.CustomerAddress).NotEmpty();
            RuleFor(x => x.CustomerPhone).NotEmpty();
            RuleFor(x => x.CustomerMail).NotEmpty();

        }
    }
    public class UpdateCustomerValidator : AbstractValidator<UpdateCustomerCommand>
    {
        public UpdateCustomerValidator()
        {
            RuleFor(x => x.CustomerCode).NotEmpty();
            RuleFor(x => x.CustomerAddress).NotEmpty();
            RuleFor(x => x.CustomerPhone).NotEmpty();
            RuleFor(x => x.CustomerMail).NotEmpty();

        }
    }
}