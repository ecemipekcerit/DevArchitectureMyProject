import { Component, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { FormBuilder,FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AlertifyService } from 'app/core/services/alertify.service';
import { LookUpService } from 'app/core/services/LookUp.service';
import { AuthService } from 'app/core/components/admin/login/services/auth.service';
import { Order } from './models/order';
import { OrderService } from './services/order.service';
import { environment } from 'environments/environment';
import { OrderDto } from './models/orderDto';
import { Product } from '../product/models/product';
import { Observable } from 'rxjs';
import { ProductService } from '../product/services/product.service';
import { map, startWith } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { LookUp } from 'app/core/models/LookUp';
import { CustomerService } from '../customer/services/customer.service';
import { Customer } from '../customer/models/customer';

declare var jQuery: any;

@Component({
	selector: 'app-order',
	templateUrl: './order.component.html',
	styleUrls: ['./order.component.scss']
})
export class OrderComponent implements AfterViewInit, OnInit {

	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;

	orderList:Order[] = [];
	order:Order=new Order();

	orderAddForm: FormGroup;

	displayedColumns: string[] = ['id', 'customerName', 'productName', 'quantity', 'status', 'update','delete'];
	dataSource: MatTableDataSource<any>;

	orderDtoList:OrderDto[] = [];
	orderDto:OrderDto=new OrderDto();

	productList: Product[]= [];
	filteredProducts: Observable<Product[]>;

	customerList:Customer[]=[];
	filteredCustomers:Observable<Customer[]>;

	orderId:number;

	constructor(private customerService:CustomerService, private productService:ProductService,private orderService:OrderService, private lookupService:LookUpService,private alertifyService:AlertifyService,private formBuilder: FormBuilder, private authService:AuthService) { }

    ngAfterViewInit(): void {
        //this.getOrderList();
    }

	ngOnInit() {
		this.getOrderDtoList();
		this.createOrderAddForm();
		this.getProductList();
		this.getCustomerList();
	}


	/* getOrderList() {
		this.orderService.getOrderList().subscribe(data => {
			this.orderList = data;
			this.dataSource = new MatTableDataSource(data);
            this.configDataTable();
		});
	} */

	getOrderDtoList() {
		this.orderService.getOrderDtoList().subscribe(data => {
			this.orderDtoList = data;
			this.dataSource = new MatTableDataSource(data);
            this.configDataTable();
		});
	}

	getCustomerList(){this.customerService.getCustomerList().subscribe((data) => {
		this.customerList = data;

		this.filteredCustomers = 
		this.orderAddForm.controls.customerId.valueChanges.pipe(
			startWith(""),
			map((value) => 
			typeof value==='string' ? value:value.customerName
			),
			map((name) => 
			name ? this._filterbyCustomer(name):this.customerList.slice()
			)
		);
	});
	}

	private _filterbyCustomer(value: string): Customer[]{
		const filterValue=value.toLowerCase();
		return this.customerList.filter((option) => option.customerName.toLowerCase().includes(filterValue));
  	}

	displayFnCustomer(c: Customer):string{
		return c && c.customerName ? c.customerName:"";
	}
	getProductList(){
		this.productService.getProductList().subscribe((data) => {
		this.productList = data;

		this.filteredProducts = 
		this.orderAddForm.controls.productId.valueChanges.pipe(
			startWith(''),
				map(value => typeof value === 'string' ? value : value.productName),
				map(name => name ? this._filterbyProduct(name) : this.productList.slice())
		);
	});
	}

	private _filterbyProduct(value: string): Product[]{
		const filterValue=value.toLowerCase();
		return this.productList.filter((option) => option.productName.toLowerCase().includes(filterValue));
  	}

	displayFnProduct(p: Product):string{
		return p && p.productName ? p.productName:"";
	}

	save(){

		if (this.orderAddForm.valid) {
			this.order = Object.assign({}, this.orderAddForm.value);
			this.order.productId= this.orderAddForm.controls["productId"].value.id;
			this.order.customerId=this.orderAddForm.controls["customerId"].value.id;
			this.order.createdUserId = this.authService.getCurrentUserId()
			this.order.lastUpdatedUserId = this.authService.getCurrentUserId()
			if (this.order.id == 0)
				this.addOrder();
			else
				this.updateOrder();
		}
	}

	addOrder(){

		this.orderService.addOrder(this.order).subscribe((data) => {
			this.getOrderDtoList();
			this.order = new Order();
			jQuery('#order').modal('hide');
			this.alertifyService.success(data);
			this.clearFormGroup(this.orderAddForm);
		},
		(error) => {
			console.log(error);
			this.alertifyService.error(error.error);
		  })

	}

	updateOrder(){

		this.orderService.updateOrder(this.order).subscribe(data => {

			var index=this.orderList.findIndex(x=>x.id==this.order.id);
			this.orderList[index]=this.order;
			this.dataSource = new MatTableDataSource(this.orderList);
            this.configDataTable();
			this.order = new Order();
			jQuery('#order').modal('hide');
			this.alertifyService.success(data);
			this.clearFormGroup(this.orderAddForm);

		})

	}

	createOrderAddForm() {
		this.orderAddForm = this.formBuilder.group({		
			id : [0],
			createdUserId : [0],
			lastUpdatedUserId : [0],
			status : [true],
			customerId : ["0", Validators.required],
			productId : ["0", Validators.required],
			quantity : ["", Validators.required]
		})
	}

	deleteOrder(orderId:number){
		this.orderService.deleteOrder(orderId).subscribe(data=>{
			this.alertifyService.success(data.toString());
			this.orderList=this.orderList.filter(x=> x.id!=orderId);
			this.dataSource = new MatTableDataSource(this.orderList);
			this.configDataTable();
		})
	}

	getOrderById(orderId:number){
		this.clearFormGroup(this.orderAddForm);
		this.orderService.getOrderById(orderId).subscribe(data=>{
			this.order=data;
			this.orderAddForm.patchValue(data);
		})
	}


	clearFormGroup(group: FormGroup) {

		group.markAsUntouched();
		group.reset();

		Object.keys(group.controls).forEach(key => {

			group.get(key).setErrors(null);
			if (key == 'id') group.get(key).setValue(0);
			else if (key == "status") group.get(key).setValue(true);
			else if (key == "productId") group.get(key).setValue('');
			else if (key == "customerId") group.get(key).setValue('');
		});
		//location.reload();
	} 

	checkClaim(claim:string):boolean{
		return this.authService.claimGuard(claim)
	}

	configDataTable(): void {
		this.dataSource.paginator = this.paginator;
		this.dataSource.sort = this.sort;
	}

	applyFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.dataSource.filter = filterValue.trim().toLowerCase();

		if (this.dataSource.paginator) {
			this.dataSource.paginator.firstPage();
		}
	}

}
