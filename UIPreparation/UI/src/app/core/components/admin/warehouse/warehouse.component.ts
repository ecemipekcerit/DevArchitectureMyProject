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
import { environment } from 'environments/environment';
import { WarehouseDto } from './models/warehuouseDto';
import { Product } from '../product/models/product';
import { Observable } from 'rxjs';
import { ProductService } from '../product/services/product.service';
import { map, startWith } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { LookUp } from 'app/core/models/LookUp';
import { ActivatedRoute, Router } from '@angular/router';
import { element } from 'protractor';

declare var jQuery: any;

@Component({
	selector: 'app-warehouse',
	templateUrl: './warehouse.component.html',
	styleUrls: ['./warehouse.component.scss']
})
export class WarehouseComponent implements AfterViewInit, OnInit {

	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;

	warehouseList: Warehouse[] = [];
	warehouse: Warehouse = new Warehouse();

	warehouseAddForm: FormGroup;

	displayedColumns: string[] = ['id', 'productId', 'productName', 'stock', 'isReady', 'update', 'delete'];
	dataSource: MatTableDataSource<any>;

	warehouseDtoList: WarehouseDto[] = [];
	warehouseDto: WarehouseDto = new WarehouseDto();

	productList: Product[] = [];
	filteredProducts: Observable<Product[]>;

	selectedWarehouse: Warehouse;

	warehouseId: number;

	constructor(private productService: ProductService, private warehouseService: WarehouseService, private lookupService: LookUpService, private alertifyService: AlertifyService, private formBuilder: FormBuilder, private authService: AuthService) { }

	ngAfterViewInit(): void {
		//this.getWarehouseList();
	}

	ngOnInit() {
		this.getWarehouseDtoList();
		this.createWarehouseAddForm();
		this.getProductList();

	}

	/*getWarehouseList() {
		this.warehouseService.getWarehouseList().subscribe(data => {
			this.warehouseList = data;
			this.dataSource = new MatTableDataSource(data);
			this.configDataTable();
		}); 
	}*/

	getWarehouseDtoList() {
		this.warehouseService.getWarehouseDtoList().subscribe(data => {
			this.warehouseDtoList = data;
			this.dataSource = new MatTableDataSource(data);
			this.configDataTable();
		});
	}

	getProductList() {
		this.productService.getProductList().subscribe((data) => {
			this.productList = data;

			this.filteredProducts = this.warehouseAddForm.controls.productId.valueChanges.pipe(
				startWith(''),
				map(value => {
					const name = typeof value === 'string' ? value : value?.productName ?? '';
					return name ? this._filterbyProduct(name) : this.productList.slice();
				}),
			);
			/* this.warehouseAddForm.controls.productId.valueChanges.pipe(
				startWith(''),
				map((value) =>
					typeof value === 'string' ? value : value?.productName??''
				),
				map((name) =>
					name ? this._filterbyProduct(name) : this.productList.slice()
				)
			); */
		});
	}

	private _filterbyProduct(value: string): Product[] {
		const filterValue = value.toLowerCase();
		return this.productList.filter((option) => option.productName.toLowerCase().includes(filterValue));
	}

	displayFnProduct(p: Product): string {
		return p && p.productName ? p.productName : "";
	}

	save() {
		if (this.warehouseAddForm.valid) {
			if (this.warehouseAddForm.controls.id === undefined) {
				this.warehouseAddForm.controls.id.setValue(0)
			} 
			if (this.selectedWarehouse === undefined) this.selectedWarehouse = new Warehouse();
			this.selectedWarehouse.id = this.warehouseAddForm.controls.id.value;
			this.selectedWarehouse.productId = this.warehouseAddForm.controls.productId.value.id;
			this.selectedWarehouse.stock = this.warehouseAddForm.controls.stock.value;
			this.selectedWarehouse.isReady = this.warehouseAddForm.controls.isReady.value;
			this.selectedWarehouse.lastUpdatedUserId = this.warehouseAddForm.controls.lastUpdatedUserId.value;
			//console.log(this.selectedWarehouse);

			if (this.selectedWarehouse.id == 0) {
				//console.log('deneme');
				this.addWarehouse();
			}

			else
				this.updateWarehouse();
		}

	}

	addWarehouse() {

		this.warehouseService.addWarehouse(this.selectedWarehouse).subscribe((data) => {
			this.getWarehouseDtoList();
			this.warehouse = new Warehouse();
			jQuery('#warehouse').modal('hide');
			this.alertifyService.success(data);
			this.clearFormGroup(this.warehouseAddForm);

		},
			(error) => {
				console.log(error);
				this.alertifyService.error(error.error);
			})

	}

	updateWarehouse() {

		this.warehouseService.updateWarehouse(this.selectedWarehouse).subscribe(data => {
			
			var index = this.dataSource.data.findIndex(x => x.id == this.selectedWarehouse.id);
			this.dataSource[index] = this.selectedWarehouse;
			this.dataSource[index].productName = this.productList.find(x => x.id == this.selectedWarehouse.productId).productName;

			//this.dataSource = new MatTableDataSource(this.warehouseDtoList);
			this.configDataTable();
			this.selectedWarehouse = new Warehouse();
			jQuery('#warehouse').modal('hide');
			this.alertifyService.success(data);
			this.clearFormGroup(this.warehouseAddForm);
		})

	}

	createWarehouseAddForm() {
		this.warehouseAddForm = this.formBuilder.group({
			id: [0],
			createdUserId: [0],
			lastUpdatedUserId: [0],
			stock: ["0", Validators.required],
			productId: ["0", Validators.required],
			isReady: [false, Validators.required]
		})
	}

	deleteWarehouse(warehouseId: number) {
		this.warehouseService.deleteWarehouse(warehouseId).subscribe(data => {
			this.alertifyService.success(data.toString());
			this.dataSource.data = this.dataSource.data.filter(x => x.id != warehouseId);
			//this.dataSource = new MatTableDataSource(this.warehouseList);
			this.configDataTable();
		})
	}

	fillWareHouseUpdateForm(element: any) {
		this.clearFormGroup(this.warehouseAddForm);
		this.selectedWarehouse = element;
		this.warehouseAddForm.setValue({
			id: element.id,
			productId: this.productList.find(x => x.id == element.productId),
			stock: element.stock,
			isReady: element.isReady,
			createdUserId: 0,
			lastUpdatedUserId: this.authService.userId ?? 1,

		})
	}

	clearFormGroup(group: FormGroup) {

		group.markAsUntouched();
		group.reset();

		Object.keys(group.controls).forEach(key => {
			group.get(key).setErrors(null);
			if (key === 'id') group.get(key).setValue(0);
			else if (key == "status") group.get(key).setValue(true);
		});
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
}
