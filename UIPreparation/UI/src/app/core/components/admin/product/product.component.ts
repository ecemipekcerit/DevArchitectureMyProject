import { Component, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AlertifyService } from 'app/core/services/alertify.service';
import { LookUp } from '../../../models/LookUp';
import { LookUpService } from 'app/core/services/LookUp.service';
import { AuthService } from 'app/core/components/admin/login/services/auth.service';
import { Product } from './models/product';
import { ProductService } from './services/product.service';
import { environment } from 'environments/environment';
import { HttpClient } from '@angular/common/http';
import {FormControl} from '@angular/forms';
import { Size } from './models/size-enum';

declare var jQuery: any;

@Component({
	selector: 'app-product',
	templateUrl: './product.component.html',
	styleUrls: ['./product.component.scss']
})
export class ProductComponent implements AfterViewInit, OnInit {

	dataSource: MatTableDataSource<any>;
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	displayedColumns: string[] = ['id','productName', 'color',  'size', 'status', 'update', 'delete'];

	productList: Product[] = [];
	product: Product = new Product();

	productAddForm: FormGroup;

	productlookup:LookUp[];
	productId: number;

	size = Size;
	sizeEnumKeys = [];

	constructor(private productService: ProductService, private lookupService: LookUpService, private alertifyService: AlertifyService, private formBuilder: FormBuilder, private authService: AuthService) {this.sizeEnumKeys=Object.keys(this.size);}

	ngAfterViewInit(): void {
		this.getProductList();
	}

	ngOnInit() {
		this.lookupService.getProductLookUp().subscribe(data => {
			this.productlookup = data;
		})
		this.createProductAddForm();
	}


	getProductList() {
		this.productService.getProductList().subscribe(data => {
			this.productList = data;
			this.dataSource = new MatTableDataSource(data);
			this.configDataTable();
		});
	}

	save() {
		if (this.productAddForm.valid) {
			this.product = Object.assign({}, this.productAddForm.value)
			this.product.createdUserId = this.authService.getCurrentUserId()
			this.product.lastUpdatedUserId = this.authService.getCurrentUserId()
			if (this.product.id == 0)
				this.addProduct();
			else
				this.updateProduct();
		}
	}

	addProduct() {

		this.productService.addProduct(this.product).subscribe(data => {
			this.getProductList();
			this.product = new Product();
			jQuery('#product').modal('hide');
			this.alertifyService.success(data);
			this.clearFormGroup(this.productAddForm);

		},
		(error) => {
			console.log(error);
			this.alertifyService.error(error.error);
		  });

	}

	updateProduct() {

		this.productService.updateProduct(this.product).subscribe(data => {

			var index = this.productList.findIndex(x => x.id == this.product.id);
			this.productList[index] = this.product;
			this.dataSource = new MatTableDataSource(this.productList);
			this.configDataTable();
			this.product = new Product();
			jQuery('#product').modal('hide');
			this.alertifyService.success(data);
			this.clearFormGroup(this.productAddForm);

		})

	}

	createProductAddForm() {
		this.productAddForm = this.formBuilder.group({
			id: [0],
			createdUserId: [0],
			lastUpdatedUserId: [0],
			status:[true],
			productName: ["", Validators.required],
			color: ["", Validators.required],
			size: [0, Validators.required]
		})
	}

	deleteProduct(productId: number) {
		this.productService.deleteProduct(productId).subscribe(data => {
			this.alertifyService.success(data.toString());
			this.productList = this.productList.filter(x => x.id != productId);
			this.dataSource = new MatTableDataSource(this.productList);
			this.configDataTable();
		})
	}

	getProductById(productId: number) {
		this.clearFormGroup(this.productAddForm);
		this.productService.getProductById(productId).subscribe(data => {
			this.product = data;
			this.productAddForm.patchValue(data);
		})
	}


	clearFormGroup(group: FormGroup) {
		group.markAsUntouched();
		group.reset();

		Object.keys(group.controls).forEach((key) => {
			group.get(key).setErrors(null);
			if (key == 'id') group.get(key).setValue(0);
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
