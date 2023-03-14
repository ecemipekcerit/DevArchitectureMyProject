
using Business.Handlers.Warehouses.Queries;
using DataAccess.Abstract;
using Moq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using static Business.Handlers.Warehouses.Queries.GetWarehouseQuery;
using Entities.Concrete;
using static Business.Handlers.Warehouses.Queries.GetWarehousesQuery;
using static Business.Handlers.Warehouses.Commands.CreateWarehouseCommand;
using Business.Handlers.Warehouses.Commands;
using Business.Constants;
using static Business.Handlers.Warehouses.Commands.UpdateWarehouseCommand;
using static Business.Handlers.Warehouses.Commands.DeleteWarehouseCommand;
using MediatR;
using System.Linq;
using FluentAssertions;


namespace Tests.Business.HandlersTest
{
    [TestFixture]
    public class WarehouseHandlerTests
    {
        Mock<IWarehouseRepository> _warehouseRepository;
        Mock<IMediator> _mediator;
        [SetUp]
        public void Setup()
        {
            _warehouseRepository = new Mock<IWarehouseRepository>();
            _mediator = new Mock<IMediator>();
        }

        [Test]
        public async Task Warehouse_GetQuery_Success()
        {
            //Arrange
            var query = new GetWarehouseQuery();

            _warehouseRepository.Setup(x => x.GetAsync(It.IsAny<Expression<Func<Warehouse, bool>>>())).ReturnsAsync(new Warehouse()
//propertyler buraya yazılacak
//{																		
//WarehouseId = 1,
//WarehouseName = "Test"
//}
);

            var handler = new GetWarehouseQueryHandler(_warehouseRepository.Object, _mediator.Object);

            //Act
            var x = await handler.Handle(query, new System.Threading.CancellationToken());

            //Asset
            x.Success.Should().BeTrue();
            //x.Data.WarehouseId.Should().Be(1);

        }

        [Test]
        public async Task Warehouse_GetQueries_Success()
        {
            //Arrange
            var query = new GetWarehousesQuery();

            _warehouseRepository.Setup(x => x.GetListAsync(It.IsAny<Expression<Func<Warehouse, bool>>>()))
                        .ReturnsAsync(new List<Warehouse> { new Warehouse() { /*TODO:propertyler buraya yazılacak WarehouseId = 1, WarehouseName = "test"*/ } });

            var handler = new GetWarehousesQueryHandler(_warehouseRepository.Object, _mediator.Object);

            //Act
            var x = await handler.Handle(query, new System.Threading.CancellationToken());

            //Asset
            x.Success.Should().BeTrue();
            ((List<Warehouse>)x.Data).Count.Should().BeGreaterThan(1);

        }

        [Test]
        public async Task Warehouse_CreateCommand_Success()
        {
            Warehouse rt = null;
            //Arrange
            var command = new CreateWarehouseCommand();
            //propertyler buraya yazılacak
            //command.WarehouseName = "deneme";

            _warehouseRepository.Setup(x => x.GetAsync(It.IsAny<Expression<Func<Warehouse, bool>>>()))
                        .ReturnsAsync(rt);

            _warehouseRepository.Setup(x => x.Add(It.IsAny<Warehouse>())).Returns(new Warehouse());

            var handler = new CreateWarehouseCommandHandler(_warehouseRepository.Object, _mediator.Object);
            var x = await handler.Handle(command, new System.Threading.CancellationToken());

            _warehouseRepository.Verify(x => x.SaveChangesAsync());
            x.Success.Should().BeTrue();
            x.Message.Should().Be(Messages.Added);
        }

        [Test]
        public async Task Warehouse_CreateCommand_NameAlreadyExist()
        {
            //Arrange
            var command = new CreateWarehouseCommand();
            //propertyler buraya yazılacak 
            //command.WarehouseName = "test";

            _warehouseRepository.Setup(x => x.Query())
                                           .Returns(new List<Warehouse> { new Warehouse() { /*TODO:propertyler buraya yazılacak WarehouseId = 1, WarehouseName = "test"*/ } }.AsQueryable());

            _warehouseRepository.Setup(x => x.Add(It.IsAny<Warehouse>())).Returns(new Warehouse());

            var handler = new CreateWarehouseCommandHandler(_warehouseRepository.Object, _mediator.Object);
            var x = await handler.Handle(command, new System.Threading.CancellationToken());

            x.Success.Should().BeFalse();
            x.Message.Should().Be(Messages.NameAlreadyExist);
        }

        [Test]
        public async Task Warehouse_UpdateCommand_Success()
        {
            //Arrange
            var command = new UpdateWarehouseCommand();
            //command.WarehouseName = "test";

            _warehouseRepository.Setup(x => x.GetAsync(It.IsAny<Expression<Func<Warehouse, bool>>>()))
                        .ReturnsAsync(new Warehouse() { /*TODO:propertyler buraya yazılacak WarehouseId = 1, WarehouseName = "deneme"*/ });

            _warehouseRepository.Setup(x => x.Update(It.IsAny<Warehouse>())).Returns(new Warehouse());

            var handler = new UpdateWarehouseCommandHandler(_warehouseRepository.Object, _mediator.Object);
            var x = await handler.Handle(command, new System.Threading.CancellationToken());

            _warehouseRepository.Verify(x => x.SaveChangesAsync());
            x.Success.Should().BeTrue();
            x.Message.Should().Be(Messages.Updated);
        }

        [Test]
        public async Task Warehouse_DeleteCommand_Success()
        {
            //Arrange
            var command = new DeleteWarehouseCommand();

            _warehouseRepository.Setup(x => x.GetAsync(It.IsAny<Expression<Func<Warehouse, bool>>>()))
                        .ReturnsAsync(new Warehouse() { /*TODO:propertyler buraya yazılacak WarehouseId = 1, WarehouseName = "deneme"*/});

            _warehouseRepository.Setup(x => x.Delete(It.IsAny<Warehouse>()));

            var handler = new DeleteWarehouseCommandHandler(_warehouseRepository.Object, _mediator.Object);
            var x = await handler.Handle(command, new System.Threading.CancellationToken());

            _warehouseRepository.Verify(x => x.SaveChangesAsync());
            x.Success.Should().BeTrue();
            x.Message.Should().Be(Messages.Deleted);
        }
    }
}

