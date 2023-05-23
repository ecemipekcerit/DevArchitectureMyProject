import { Component, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AlertifyService } from 'app/core/services/alertify.service';
import { LookUpService } from 'app/core/services/LookUp.service';
import { AuthService } from 'app/core/components/admin/login/services/auth.service';
import { Warehouse } from './models/warehouse'
import { WarehouseService } from './services/warehouse.service';
//import { WarehouseDto } from './models/warehuouseDto';
import { Product } from '../product/models/product';
import { Observable } from 'rxjs';
import { ProductService } from '../product/services/product.service';
import { map, startWith } from 'rxjs/operators';
import { LookUp } from 'app/core/models/LookUp';
import { QualityControlTypeEnumLabelMappingSize, Size} from '../product/models/size-enum';
import { QualityControlTypeEnumLabelMappingColor, Color } from '../product/models/color-enum';

declare var jQuery: any;

@Component({
	selector: 'app-warehouse',
	templateUrl: './warehouse.component.html',
	styleUrls: ['./warehouse.component.scss']
})

export class WarehouseComponent implements AfterViewInit, OnInit {
	
	dataSource: MatTableDataSource<any>;
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	displayedColumns: string[] = ['id', 'productName', 'color', 'size', 'quantity' ,'createdDate', 'isReady', 'update', 'delete'];

	warehouseList: Warehouse[];
	warehouse: Warehouse = new Warehouse();
	warehouseAddForm: FormGroup;
	products: Product[] = [];

	SizeLookUp: LookUp[] = [];
	sizess: string[] = Object.keys(QualityControlTypeEnumLabelMappingSize);

	ColorLookUp: LookUp[] = [];
	colorss: string[] = Object.keys(QualityControlTypeEnumLabelMappingColor);

	warehouseId: number;

	filteredProducts: Observable<Product[]>;
	filteredColors: Observable<LookUp[]>;
	filteredSizes: Observable<LookUp[]>;
	
	selectedWarehouse: Warehouse;
	
	range = new FormGroup({
		start: new FormControl(),
		end: new FormControl(),
	});
	
	startDate: string;
	endDate: string;

	// warehouseDtoList: WarehouseDto[] = [];
	// warehouseDto: WarehouseDto = new WarehouseDto();
	// warehouseByDateList = WarehouseDto;
	// selectedSize:WarehouseDto;
	// selectedColor: WarehouseDto

	constructor(private productService: ProductService, private warehouseService: WarehouseService, private lookupService: LookUpService, private alertifyService: AlertifyService, private formBuilder: FormBuilder, private authService: AuthService) {


	 }

	ngAfterViewInit(): void {

		this.getWarehouseDtoList();
	}

	ngOnInit() {

		// this.getWarehouseDtoList();
		this.getProductList();
		this.createWarehouseAddForm();
		this.getColorList();
		this.getSizeList();
	}

	getWarehouseDtoList() {

		this.warehouseService.getWarehouseDtoList().subscribe(data => {
			this.warehouseList = data;
			this.dataSource = new MatTableDataSource(data);
			this.configDataTable();
		});
	}
	
	getProductList() {

		this.productService.getProductList().subscribe((data) => {
			this.products = data;
			this.filteredProducts = this.warehouseAddForm.controls.productId.valueChanges.pipe(
				startWith(''),
				map(value => {
					const name = typeof value === 'string' ? value : value?.productName ?? '';
					return name ? this._filterbyProduct(name) : this.products.slice();
				}),
			);
		});
	}

	private _filterbyProduct(value: string): Product[] {

		const filterValue = value.toLocaleLowerCase();
		return this.products.filter((option) => option.productName.toLocaleLowerCase().includes(filterValue));
	}

	displayFnProduct(p: Product): string {

		return p && p.productName ? p.productName : "";
	}

	getColorList(){

		this.colorss.forEach(x=>{
			this.ColorLookUp.push({
				id: [Number(x)], label: QualityControlTypeEnumLabelMappingColor[Number(x)]
			});
		});
		this.filteredColors= this.warehouseAddForm.controls.color.valueChanges.pipe(
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

	getSizeList(){

		this.sizess.forEach(x=>{
			this.SizeLookUp.push({
				id: [Number(x)], label: QualityControlTypeEnumLabelMappingSize[Number(x)]
			});
		});
		this.filteredSizes= this.warehouseAddForm.controls.size.valueChanges.pipe(
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

		if (this.warehouseAddForm.valid) {
			this.warehouse = Object.assign({}, this.warehouseAddForm.value)
			this.warehouse.productId = this.warehouse.productId['id'];

			if (this.warehouse.id == 0) {
				this.warehouse.createdUserId = this.authService.getCurrentUserId();
				this.warehouse.lastUpdatedUserId = this.authService.getCurrentUserId();
				this.warehouse.isDeleted = false;
				this.addWarehouse();
			}
			else {
				this.updateWarehouse();
			}
		}

		// if (this.warehouseAddForm.valid) {
		// 	if (this.warehouseAddForm.controls.id === undefined) {
		// 		this.warehouseAddForm.controls.id.setValue(0)
		// 	} 
		// 	if (this.selectedWarehouse === undefined) this.selectedWarehouse = new Warehouse();
		// 	this.selectedWarehouse.id = this.warehouseAddForm.controls.id.value;
		// 	this.selectedWarehouse.productId = this.warehouseAddForm.controls.productId.value.id;
		// 	this.selectedWarehouse.quantity = this.warehouseAddForm.controls.quantity.value;
		// 	this.selectedWarehouse.isReady = this.warehouseAddForm.controls.isReady.value;
		// 	this.selectedWarehouse.lastUpdatedUserId = this.warehouseAddForm.controls.lastUpdatedUserId.value;
		// 	this.selectedWarehouse.color=this.warehouseAddForm.controls.color.value;
		// 	this.selectedWarehouse.size=this.warehouseAddForm.controls.size.value;

		// 	if (this.selectedWarehouse.id == 0) {
		// 		this.addWarehouse();
		// 	}

		// 	else
		// 		this.updateWarehouse();
		// }

	}

	addWarehouse() {

		this.warehouseService.addWarehouse(this.warehouse).subscribe((data) => {
			//this.getWarehouseDtoList();
			this.getProductList();
			this.warehouse = new Warehouse();
			jQuery('#warehouse').modal('hide');
			this.alertifyService.success(data);
			this.clearFormGroup(this.warehouseAddForm);
			this.getWarehouseDtoList();

		},
			(error) => {
				console.log(error);
				this.alertifyService.error(error.error);
			})
	}

	updateWarehouse() {

		this.warehouseService.updateWarehouse(this.warehouse).subscribe(data => {
			var index = this.warehouseList.findIndex(x => x.id == this.warehouse.id);
			
			this.warehouseList[index] = this.warehouse;
			this.dataSource = new MatTableDataSource(this.warehouseList);
			this.configDataTable();
			this.warehouse = new Warehouse();
			jQuery('#warehouse').modal('hide');
			this.alertifyService.success(data);
			this.clearFormGroup(this.warehouseAddForm);
			this.getWarehouseDtoList();

			// var index = this.dataSource.data.findIndex(x => x.id == this.selectedWarehouse.id);
			// this.dataSource[index] = this.selectedWarehouse;
			// this.dataSource[index].productName = this.products.find(x => x.id == this.selectedWarehouse.productId).productName;
			// this.dataSource[index].size = this.SizeLookUp.find(y=>y.id == this.selectedWarehouse.size).label;
			// this.dataSource[index].color = this.ColorLookUp.find(z=>z.id == this.selectedWarehouse.color).label;
			// this.configDataTable();
			// this.selectedWarehouse = new Warehouse();
			// jQuery('#warehouse').modal('hide');
			// this.alertifyService.success(data);
			// this.clearFormGroup(this.warehouseAddForm);
		}, responseError => {
			this.alertifyService.error(responseError.error)
		})

	}

	createWarehouseAddForm() {	

		this.warehouseAddForm = this.formBuilder.group({
			id: [0],
			//createdUserId: [0],
			//lastUpdatedUserId: [0],
			status: [false, Validators.required],
			isDeleted: [Validators.required],
			quantity: ["", Validators.required],
			productId: [0, Validators.required],
			productName: [""],
			isReady: [true, Validators.required],
			color : ["", Validators.required],
			size : ["", Validators.required]		
		})
	}

	deleteWarehouse(warehouseId: number) {

		this.warehouseService.deleteWarehouse(warehouseId).subscribe(data => {
			this.alertifyService.success(data.toString());
			this.warehouseList = this.warehouseList.filter(x => x.id != warehouseId);
			//this.dataSource.data = this.dataSource.data.filter(x => x.id != warehouseId);
			this.dataSource = new MatTableDataSource(this.warehouseList);
			this.configDataTable();
		})
	}

	getWarehouseById (element: any) {
		
		this.clearFormGroup(this.warehouseAddForm);
		this.selectedWarehouse = element;
		this.warehouseAddForm.setValue({
			id: element.id,
			status: element.status,
			isDeleted: element.isDeleted,
			productId: this.products.find(x => x.id == element.productId),
			productName: element.productName,
			quantity: element.quantity,
			isReady: element.isReady,
			color: element.color,
			size: element.size,
		})
					
	}

	// getWarehouseById(element: any) {

	// 	this.clearFormGroup(this.warehouseAddForm);
	// 	this.selectedWarehouse = element;
	// 	this.warehouseAddForm.setValue({
	// 		id: element.id,
	// 		productId: this.productList.find(x => x.id == element.productId),
	// 		quantity: element.quantity,
	// 		isReady: element.isReady,
	// 		createdUserId: 0,
	// 		lastUpdatedUserId: this.authService.userId ?? 1,
	// 		color: element.color,
	// 		size:element.size,

	// 	})
	// }

	clearFormGroup(group: FormGroup) {

		group.markAsUntouched();
		group.reset();

		Object.keys(group.controls).forEach(key => {
			group.get(key).setErrors(null);
			if (key == 'id')
				group.get(key).setValue(0);
			if (key == 'productId')
				group.get(key).setValue(0);
			if (key == 'quantity')
				group.get(key).setValue(0);
			if (key == 'isReady')
				group.get(key).setValue(false);
			if (key == 'size')
				group.get(key).setValue(0);
			if (key == 'color')
				group.get(key).setValue(0);
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
		// 	if (key === 'id') group.get(key).setValue(0);
		// 	else if (key == "status") group.get(key).setValue(true);
		// });
	}

	checkClaim(claim: string): boolean {

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

	getFilterByDate(): void {

		this.startDate = this.range.controls.start.value.toLocaleString('tr-TR').slice(0,10);
		this.endDate = this.range.controls.end.value.toLocaleString('tr-TR').slice(0,10);

		this.warehouseService.getFilterByDate(this.startDate, this.endDate).subscribe(data => {
			this.warehouseList = data;
			this.dataSource = new MatTableDataSource(this.warehouseList);
			this.configDataTable();
		});
		
		// this.warehouseList = this.dataSource.data.filter(x => x.createdDate >= this.startDate && x.createdDate <= this.endDate);
		// this.dataSource = new MatTableDataSource(this.warehouseList);
		// this.configDataTable();
	}

	clearFilter(){
	
		this.range.reset();
		this.getWarehouseDtoList();
	}
	
}
