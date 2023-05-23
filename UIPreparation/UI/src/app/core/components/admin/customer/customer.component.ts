import { Component, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AlertifyService } from 'app/core/services/alertify.service';
import { LookUp } from '../../../models/LookUp';
import { LookUpService } from 'app/core/services/LookUp.service';
import { AuthService } from 'app/core/components/admin/login/services/auth.service';
import { Customer } from './models/customer';
import { CustomerService } from './services/customer.service';
import { environment } from 'environments/environment';
import { HttpClient } from '@angular/common/http';

declare var jQuery: any;

@Component({
	selector: 'app-customer',
	templateUrl: './customer.component.html',
	styleUrls: ['./customer.component.scss']
})
export class CustomerComponent implements AfterViewInit, OnInit {
	
	dataSource: MatTableDataSource<any>;
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	displayedColumns: string[] = ['id', 'customerName', 'customerCode', 'customerAddress', 'customerPhone', 'customerMail','status', 'update','delete'];

	customerList:Customer[] = [];
	customer:Customer = new Customer();

	customerAddForm: FormGroup;
	
	customerlookup: LookUp[];
	
	
	customerId:number;

	constructor(private customerService:CustomerService, private lookupService:LookUpService,private alertifyService:AlertifyService,private formBuilder: FormBuilder, private authService:AuthService) { }

    ngAfterViewInit(): void {
        this.getCustomerList();
    }

	ngOnInit() {
		this.lookupService.getCustomerLookUp().subscribe(data => {
			this.customerlookup = data;
		})

		this.createCustomerAddForm();
	}


	getCustomerList() {
		this.customerService.getCustomerList().subscribe(data => {
			this.customerList = data;
			this.dataSource = new MatTableDataSource(data);
            this.configDataTable();
		});
	}

	save(){

		if (this.customerAddForm.valid) {
			this.customer = Object.assign({}, this.customerAddForm.value)
			this.customer.createdUserId = this.authService.getCurrentUserId()
			this.customer.lastUpdatedUserId = this.authService.getCurrentUserId()
			if (this.customer.id == 0)
				this.addCustomer();
			else
				this.updateCustomer();
		}

	}

	addCustomer(){

		this.customerService.addCustomer(this.customer).subscribe(data => {
			this.getCustomerList();
			this.customer = new Customer();
			jQuery('#customer').modal('hide');
			this.alertifyService.success(data);
			this.clearFormGroup(this.customerAddForm);

		},
		(error) => {
			console.log(error);
			this.alertifyService.error(error.error);
		  });

	}

	updateCustomer(){

		this.customerService.updateCustomer(this.customer).subscribe(data => {

			var index=this.customerList.findIndex(x=>x.id==this.customer.id);
			this.customerList[index]=this.customer;
			this.dataSource = new MatTableDataSource(this.customerList);
            this.configDataTable();
			this.customer = new Customer();
			jQuery('#customer').modal('hide');
			this.alertifyService.success(data);
			this.clearFormGroup(this.customerAddForm);

		})

	}

	createCustomerAddForm() {
		this.customerAddForm = this.formBuilder.group({		
			id : [0],
			createdUserId : [0],
			lastUpdatedUserId : [0],
			status : [true],
			customerName : ["", Validators.required],
			customerCode : ["", Validators.required],
			customerAddress : ["", Validators.required],
			customerPhone : ["", Validators.required],
			customerMail : ["", Validators.required]
		})
	}

	deleteCustomer(customerId:number){
		this.customerService.deleteCustomer(customerId).subscribe(data=>{
			this.alertifyService.success(data.toString());
			this.customerList=this.customerList.filter(x=> x.id!=customerId);
			this.dataSource = new MatTableDataSource(this.customerList);
			this.configDataTable();
		})
	}

	getCustomerById(customerId:number){
		this.clearFormGroup(this.customerAddForm);
		this.customerService.getCustomerById(customerId).subscribe(data=>{
			this.customer=data;
			this.customerAddForm.patchValue(data);
		})
	}


	clearFormGroup(group: FormGroup) {
		group.markAsUntouched();
		group.reset();

		Object.keys(group.controls).forEach(key => {
			group.get(key).setErrors(null);
			if (key == 'id') group.get(key).setValue(0);
			else if (key == "status") group.get(key).setValue(true);
		});
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
