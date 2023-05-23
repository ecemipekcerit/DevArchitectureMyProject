export class Warehouse {
id?:number; 
createdUserId?:number; 
createdDate?:(Date | any); 
lastUpdatedUserId?:number; 
lastUpdatedDate?:(Date | any); 
status:boolean; 
isDeleted:boolean; 
productId?:number; 
size?: string;
color?: string;
quantity?:number; 
isReady:boolean; 
}