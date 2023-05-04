import { Component, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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

declare var jQuery: any;

@Component({
	selector: 'app-warehouse',
	templateUrl: './warehouse.component.html',
	styleUrls: ['./warehouse.component.scss']
})
export class WarehouseComponent implements AfterViewInit, OnInit {
	
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	
	warehouseList:Warehouse[] = [];
	warehouse:Warehouse=new Warehouse();

	warehouseAddForm: FormGroup;

	displayedColumns: string[] = ['id','productId', 'productName', 'stock' ,'isReady','update','delete'];
	dataSource: MatTableDataSource<any>;

	warehouseDtoList:WarehouseDto[] = [];
	warehouseDto:WarehouseDto=new WarehouseDto();

	productList: Product[]= [];
	filteredProducts: Observable<Product[]>;

	warehouseId:number;

	constructor(private productService:ProductService, private warehouseService:WarehouseService, private lookupService:LookUpService,private alertifyService:AlertifyService,private formBuilder: FormBuilder, private authService:AuthService) { }

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

	getProductList(){this.productService.getProductList().subscribe((data) => {
		this.productList = data;

		this.filteredProducts = 
		this.warehouseAddForm.controls.productId.valueChanges.pipe(
			startWith(''),
			map((value) => 
			typeof value==='string' ? value:value.productName
			),
			map((name) => 
			name ? this._filterbyProduct(name):this.productList.slice()
			)
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

		if (this.warehouseAddForm.valid) {
			this.warehouse = Object.assign({}, this.warehouseAddForm.value);
			this.warehouse.productId= this.warehouseAddForm.controls["productId"].value.id;
			this.warehouse.createdUserId = this.authService.getCurrentUserId()
			this.warehouse.lastUpdatedUserId = this.authService.getCurrentUserId()
			if (this.warehouse.id == 0)
				this.addWarehouse();
			else
				this.updateWarehouse();
		}

	}

	addWarehouse(){

		this.warehouseService.addWarehouse(this.warehouse).subscribe((data) => {
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

	updateWarehouse(){

		this.warehouseService.updateWarehouse(this.warehouse).subscribe(data => {

			var index=this.warehouseList.findIndex(x=>x.id==this.warehouse.id);
			this.warehouseList[index]=this.warehouse;
			this.dataSource = new MatTableDataSource(this.warehouseList);
            this.configDataTable();
			this.warehouse = new Warehouse();
			jQuery('#warehouse').modal('hide');
			this.alertifyService.success(data);
			this.clearFormGroup(this.warehouseAddForm);

		})

	}

	createWarehouseAddForm() {
		this.warehouseAddForm = this.formBuilder.group({		
			id : [0],
			createdUserId : [0],
			lastUpdatedUserId : [0],
			status : [true],
			productId : ["0", Validators.required],
			stock : ["", Validators.required],
			isReady : [false, Validators.required]
		})
	}

	deleteWarehouse(warehouseId:number){
		this.warehouseService.deleteWarehouse(warehouseId).subscribe(data=>{
			this.alertifyService.success(data.toString());
			this.warehouseList=this.warehouseList.filter(x=> x.id!=warehouseId);
			this.dataSource = new MatTableDataSource(this.warehouseList);
			this.configDataTable();
		})
	}

	getWarehouseById(warehouseId:number){
		this.clearFormGroup(this.warehouseAddForm);
		this.warehouseService.getWarehouseById(warehouseId).subscribe(data=>{
			this.warehouse=data;
			this.warehouseAddForm.patchValue(data);
		})
	}

	clearFormGroup(group: FormGroup) {

		group.markAsUntouched();
		group.reset();

		Object.keys(group.controls).forEach(key => {
			group.get(key).setErrors(null);
			if (key === 'id') group.get(key).setValue(0);
			else if (key == "status") group.get(key).setValue(true);
			else if (key == "productId") group.get(key).setValue(null);
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
