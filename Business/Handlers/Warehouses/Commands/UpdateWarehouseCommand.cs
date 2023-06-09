﻿
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
using Business.Handlers.Warehouses.ValidationRules;
using System;

namespace Business.Handlers.Warehouses.Commands
{


    public class UpdateWarehouseCommand : IRequest<IResult>
    {
        public int Id { get; set; }
        public int CreatedUserId { get; set; }
        public int LastUpdatedUserId { get; set; }
        public System.DateTime LastUpdatedDate { get; set; }
        public bool Status { get; set; }
        public bool isDeleted { get; set; }
        public int ProductId { get; set; }
        public string Size { get; set; }
        public string Color { get; set; }
        public int Quantity { get; set; }
        public bool isReady { get; set; }

        public class UpdateWarehouseCommandHandler : IRequestHandler<UpdateWarehouseCommand, IResult>
        {
            private readonly IWarehouseRepository _warehouseRepository;
            private readonly IMediator _mediator;

            public UpdateWarehouseCommandHandler(IWarehouseRepository warehouseRepository, IMediator mediator)
            {
                _warehouseRepository = warehouseRepository;
                _mediator = mediator;
            }

            [ValidationAspect(typeof(UpdateWarehouseValidator), Priority = 1)]
            [CacheRemoveAspect("Get")]
            [LogAspect(typeof(FileLogger))]
            [SecuredOperation(Priority = 1)]
            public async Task<IResult> Handle(UpdateWarehouseCommand request, CancellationToken cancellationToken)
            {
                var isThereWarehouseRecord = await _warehouseRepository.GetAsync(u => u.Id == request.Id);


                isThereWarehouseRecord.CreatedUserId = request.CreatedUserId;
                isThereWarehouseRecord.LastUpdatedUserId = request.LastUpdatedUserId;
                isThereWarehouseRecord.LastUpdatedDate = System.DateTime.Now;
                isThereWarehouseRecord.Status = request.Status;
                isThereWarehouseRecord.isDeleted = request.isDeleted;
                isThereWarehouseRecord.ProductId = request.ProductId;
                isThereWarehouseRecord.Quantity = request.Quantity;
                isThereWarehouseRecord.isReady = request.isReady;
                isThereWarehouseRecord.Color = request.Color;
                isThereWarehouseRecord.Size = request.Size;


                _warehouseRepository.Update(isThereWarehouseRecord);
                await _warehouseRepository.SaveChangesAsync();
                return new SuccessResult(Messages.Updated);
            }
        }
    }
}

