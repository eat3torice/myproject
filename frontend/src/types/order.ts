import type { Order } from './index';

export interface OrderLine {
    PK_OrderLine: number;
    OrderID: number;
    VariationID?: number;
    VariationName?: string;
    Quantity: number;
    Unit_Price: number;
    Price: number;
    Status?: string;
    Creation_date?: string;
}

export interface OrderDetail extends Order {
    order_lines: OrderLine[];
}
