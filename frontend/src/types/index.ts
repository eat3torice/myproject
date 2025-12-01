export interface Product {
    PK_Product: number;
    Name: string;
    Images: string;
    CategoryID: number;
    BrandID: number;
}

export interface Category {
    PK_Category: number;
    Name: string;
    Status?: string;
}

export interface Brand {
    PK_Brand: number;
    Name: string;
    Note?: string;
    Status?: string;
}

export interface Variation {
    PK_Variation: number;
    ProductID: number;
    SKU: string;
    Name: string;
    Price: number;
    Quantity: number;
    Color?: string;
    Material?: string;
    Size?: string;
    Description?: string;
    Sold?: number;
    Status?: string;
}

export interface Customer {
    PK_Customer: number;
    AccountID?: number;
    Name: string;
    Address?: string;
    Phone?: string;
    Note?: string;
    Status?: string;
    Creation_date?: string;
}

export interface Employee {
    PK_Employee: number;
    AccountID: number;
    Name: string;
    Phone?: string;
    Email?: string;
    Status?: string;
    Creation_date?: string;
}

export interface Order {
    PK_POSOrder: number;
    CustomerID?: number;
    EmployeeID?: number;
    Creation_date?: string;
    Total_Amount: number;
    Total_Payment: number;
    PaymentMethodID: number;
    Note?: string;
    Status: string;
    Order_Date?: string;
    Payment_Date?: string;
    Type_Order: string;
    ShippingAddress?: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
    role_id: number;
    account_status: string;
}
