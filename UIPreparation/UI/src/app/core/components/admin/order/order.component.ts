import { Component, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AlertifyService } from 'app/core/services/alertify.service';
import { LookUpService } from 'app/core/services/LookUp.service';
import { AuthService } from 'app/core/components/admin/login/services/auth.service';
import { Order } from './models/order';
import { OrderService } from './services/order.service';
//import { OrderDto } from './models/orderDto';
import { Product } from '../product/models/product';
import { Observable } from 'rxjs';
import { ProductService } from '../product/services/product.service';
import { map, startWith } from 'rxjs/operators';
import { LookUp } from 'app/core/models/LookUp';
import { CustomerService } from '../customer/services/customer.service';
import { Customer } from '../customer/models/customer';
import { QualityControlTypeEnumLabelMappingColor, Color } from '../product/models/color-enum';
import { QualityControlTypeEnumLabelMappingSize, Size} from '../product/models/size-enum';

declare var jQuery: any;

@Component({
	selector: 'app-order',
	templateUrl: './order.component.html',
	styleUrls: ['./order.component.scss']
})

export class OrderComponent implements AfterViewInit, OnInit {

	dataSource: MatTableDataSource<any>;
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	displayedColumns: string[] = ['id', 'customerName', 'productName', 'color', 'size', 'quantity', 'update','delete'];

	orderList: Order[] = [];
	order: Order = new Order();
	orderAddForm: FormGroup;
	products: Product[] = [];
	customers: Customer[] = [];

	SizeLookUp: LookUp[] = [];
	sizess: string[] = Object.keys(QualityControlTypeEnumLabelMappingSize);

	ColorLookUp: LookUp[] = [];
	colorss: string[] = Object.keys(QualityControlTypeEnumLabelMappingColor);

	orderId: number;

	filteredProducts: Observable<Product[]>;
	filteredCustomers: Observable<Customer[]>;
	filteredColors: Observable<LookUp[]>;
	filteredSizes: Observable<LookUp[]>;

	selectedOrder: Order;

	// orderDtoList: OrderDto[] = [];
	// orderDto: OrderDto = new OrderDto();
	// orderDtoId:number;

	constructor(private customerService:CustomerService, private productService:ProductService,private orderService:OrderService, private lookupService:LookUpService, private alertifyService:AlertifyService,private formBuilder: FormBuilder, private authService:AuthService) {}

    ngAfterViewInit(): void {

		this.getOrderDtoList();
	}

	ngOnInit() {

		//this.getOrderDtoList();
		this.getProductList();
		this.getCustomerList();
		this.createOrderAddForm();
		this.getColorList();
		this.getSizeList(); 
	}

	getOrderDtoList() {
		
		this.orderService.getOrderDtoList().subscribe(data => {
			this.orderList = data;
			this.dataSource = new MatTableDataSource(data);
            this.configDataTable();
		});
	}

	getCustomerList(){

		this.customerService.getCustomerList().subscribe((data) => {
			this.customers = data;
			this.filteredCustomers = this.orderAddForm.controls.customerId.valueChanges.pipe(
				startWith(""),
				map((value) => {
					const name = typeof value ==='string' ? value:value?.customerName??'';
					return name ? this._filterbyCustomer(name):this.customers.slice(); 
				}),
			);
		});
	}

	private _filterbyCustomer(value: string): Customer[]{

		const filterValue=value.toLowerCase();
		return this.customers.filter((option) => option.customerName.toLowerCase().includes(filterValue));
  	}

	displayFnCustomer(c: Customer):string{

		return c && c.customerName ? c.customerName:"";
	}

	getProductList() {

		this.productService.getProductList().subscribe((data) => {
			this.products = data;

			this.filteredProducts= this.orderAddForm.controls.productId.valueChanges.pipe(
				startWith(""),
				map((value) => {
					const name = typeof value ==='string' ? value:value?.productName??'';
					return name ? this._filterbyProduct(name):this.products.slice();
				}),
			);
			
		});
	}

	private _filterbyProduct(value: string): Product[] {

		const filterValue=value.toLowerCase();
		return this.products.filter((option) => option.productName.toLowerCase().includes(filterValue));
  	}

	displayFnProduct(p: Product):string{

		return p && p.productName ? p.productName:"";
	}

 	getColorList() {

		this.colorss.forEach(x=>{
			this.ColorLookUp.push({
				id: [Number(x)], label: QualityControlTypeEnumLabelMappingColor[Number(x)]
			});
		});
		this.filteredColors= this.orderAddForm.controls.color.valueChanges.pipe(
			startWith(""),
			map((value) => {
				const name = typeof value ==='string' ? value:value?.label??'';
				return name ? this._filterbyColor(name):this.ColorLookUp.slice();
			}),
		);
	}

	private _filterbyColor(value: string): LookUp[] {

		const filterValue=value.toLowerCase();
		return this.ColorLookUp.filter((option) => option.label.toLowerCase().includes(filterValue));
  	}

	getSizeList() {

		this.sizess.forEach(x=>{
			this.SizeLookUp.push({
				id: [Number(x)], label: QualityControlTypeEnumLabelMappingSize[Number(x)]
			});
		});
		this.filteredSizes= this.orderAddForm.controls.size.valueChanges.pipe(
			startWith(""),
			map((value) => {
				const name = typeof value ==='string' ? value:value?.label??'';
				return name ? this._filterbySize(name):this.SizeLookUp.slice();
			}),
		);
	}

	private _filterbySize(value: string): LookUp[] {

		const filterValue=value.toLowerCase();
		return this.SizeLookUp.filter((option) => option.label.toLowerCase().includes(filterValue));
  	}

	save() {

		if (this.orderAddForm.valid) {
			this.order = Object.assign({}, this.orderAddForm.value)
			this.order.productId = this.order.productId['id'];
			this.order.customerId = this.order.customerId['id'];

			if (this.order.id == 0) {
				this.order.createdUserId = this.authService.getCurrentUserId();
				this.order.lastUpdatedUserId = this.authService.getCurrentUserId();
				this.order.createdDate = Date.now;
				this.order.lastUpdatedDate = Date.now;
				this.order.isDeleted = false;
				this.addOrder();
			}
			else {
				this.order.lastUpdatedUserId = this.authService.getCurrentUserId();
				this.updateOrder();
			}
		}
	}

	addOrder() {
		this.orderService.addOrder(this.order).subscribe((data) => {
			//this.getOrderDtoList();
			this.getCustomerList();
			this.getProductList();
			this.order = new Order();
			jQuery('#order').modal('hide');
			this.alertifyService.success(data);
			this.clearFormGroup(this.orderAddForm);
			this.getOrderDtoList();
			
		},
			(error) => {
				console.log(error);
				this.alertifyService.error(error.error);
		  	})

	}

	updateOrder() {

		this.orderService.updateOrder(this.order).subscribe(data => {
			var index = this.orderList.findIndex(x => x.id == this.order.id);
			this.orderList[index] = this.order;
			this.dataSource = new MatTableDataSource(this.orderList);
			this.configDataTable();
			this.order = new Order();
			jQuery('#order').modal('hide');
			this.alertifyService.success(data);
			this.clearFormGroup(this.orderAddForm);
			this.getOrderDtoList();
		}, responseError => {
			this.alertifyService.error(responseError.error)
		})

	}

	createOrderAddForm() {

		this.orderAddForm = this.formBuilder.group({		
			id : [0],
			//createdUserId : [0],
			//lastUpdatedUserId : [0],
			status: [false, Validators.required],
			isDeleted: [Validators.required],
			customerId : [0, Validators.required],
			customerName: [""],
			productId: [0, Validators.required],
			productName: [""],
			quantity : [0, Validators.required],
			color : ["", Validators.required],
			size : ["", Validators.required]
		})
	}

	deleteOrder(orderId:number) {

		this.orderService.deleteOrder(orderId).subscribe(data=>{
			this.alertifyService.success(data.toString());
			//this.dataSource.data = this.dataSource.data.filter(x => x.id != orderId);
			this.orderList = this.orderList.filter(x => x.id != orderId);
			this.dataSource = new MatTableDataSource(this.orderList);
			this.configDataTable();
		})
	}

	getOrderById(element: any) {

		this.clearFormGroup(this.orderAddForm);
		this.selectedOrder = element;
		this.orderAddForm.setValue({
			id:element.id,
			status: element.status,
			isDeleted: element.isDeleted,
			customerId:this.customers.find(y => y.id == element.customerId),
			customerName: element.customerName,
			productId: this.products.find(x => x.id == element.productId),
			productName: element.productName,
			quantity:element.quantity,
			color: element.color,
			size: element.size,
			//createdUserId: 0,
			//lastUpdatedUserId: this.authService.userId ?? 1,
		})
	}


	clearFormGroup(group: FormGroup) {

		group.markAsUntouched();
		group.reset();

		Object.keys(group.controls).forEach(key => {
			group.get(key).setErrors(null);
			if (key == 'id')
				group.get(key).setValue(0);
			if (key == 'productId')
				group.get(key).setValue(0);
			if (key == 'customerId')
				group.get(key).setValue(0);
			if (key == 'quantity')
				group.get(key).setValue(0);
			if (key == 'size')
				group.get(key).setValue("");
			if (key == 'color')
				group.get(key).setValue("");
			if (key == 'status')
				group.get(key).setValue(true);
			if (key == 'isDeleted')
				group.get(key).setValue(false);
			if (key == 'createdUserId')
				group.get(key).setValue(this.authService.getCurrentUserId());
			if (key == 'createdDate')
				group.get(key).setValue(Date.now);
			if (key == 'lastUpdatedUserId')
				group.get(key).setValue(this.authService.getCurrentUserId());
			if (key == 'lastUpdatedDate')
				group.get(key).setValue(Date.now);
		});

		// Object.keys(group.controls).forEach(key => {

		// 	group.get(key).setErrors(null);
		// 	if (key == 'id') group.get(key).setValue(0);
		// 	else if (key == "status") group.get(key).setValue(true);
		// });
	} 

	checkClaim(claim:string):boolean {

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
