export class WarehouseDto {
    id?: number;
    createdUserId?: number;
    createdDate?: (Date | any);
    lastUpdatedUserId?: number;
    lastUpdatedDate?: (Date | any);
    status: boolean;
    isDeleted: boolean;
    productId?: number;
    productName?: string;
    size?: string;
    color?: string;
    quantity?: number;
    isReady: boolean; 
}