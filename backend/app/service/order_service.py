from datetime import datetime
from decimal import Decimal

from sqlalchemy.orm import Session

from app.model.orderline_model import OrderLine
from app.model.posorder_model import POSOrder
from app.model.variation_model import Variation
from app.schema.order_schema import OrderCreate, OrderUpdate


class OrderService:
    def __init__(self, db: Session):
        self.db = db

    def get_orders(self, skip: int = 0, limit: int = 100, status: str = None):
        query = self.db.query(POSOrder)
        if status:
            query = query.filter(POSOrder.Status == status)
        return query.order_by(POSOrder.Creation_date.desc()).offset(skip).limit(limit).all()

    def get_order_by_id(self, order_id: int):
        order = self.db.query(POSOrder).filter(POSOrder.PK_POSOrder == order_id).first()
        if not order:
            return None

        # Add shipping address if exists
        shipping_address = None
        if order.AddressID:
            from app.model.address_model import Address, District, Province, Ward
            address = self.db.query(Address).filter(Address.PK_Address == order.AddressID).first()
            if address:
                province = self.db.query(Province).filter(Province.PK_Province == address.ProvinceID).first()
                district = self.db.query(District).filter(District.PK_District == address.DistrictID).first()
                ward = self.db.query(Ward).filter(Ward.PK_Ward == address.WardID).first()

                address_parts = []
                if address.StreetAddress:
                    address_parts.append(address.StreetAddress)
                if ward:
                    address_parts.append(ward.Name)
                if district:
                    address_parts.append(district.Name)
                if province:
                    address_parts.append(province.Name)

                shipping_address = ", ".join(address_parts)

        # Sync order line status if order is cancelled or completed
        if order.Status and order.Status.upper() in ["CANCELLED", "COMPLETED"]:
            order_lines = self.db.query(OrderLine).filter(OrderLine.OrderID == order_id).all()
            for line in order_lines:
                if line.Status.upper() != order.Status.upper():
                    line.Status = order.Status.upper()
            self.db.commit()

        # Add shipping address to order object
        order.ShippingAddress = shipping_address
        return order

    def create_order(self, order_data: OrderCreate):
        # Calculate totals
        total_amount = Decimal(0)
        for line in order_data.order_lines:
            total_amount += line.Unit_Price * line.Quantity

        # Create order
        db_order = POSOrder(
            CustomerID=order_data.CustomerID,
            EmployeeID=order_data.EmployeeID,
            AddressID=order_data.AddressID,
            PaymentMethodID=order_data.PaymentMethodID,
            Note=order_data.Note,
            Type_Order=order_data.Type_Order,
            Total_Amount=total_amount,
            Total_Payment=total_amount,
            Status="pending",
            Creation_date=datetime.now(),
            Order_Date=datetime.now(),
        )
        self.db.add(db_order)
        self.db.flush()  # Get order ID

        # Create order lines
        for line_data in order_data.order_lines:
            line_total = line_data.Unit_Price * line_data.Quantity
            order_line = OrderLine(
                OrderID=db_order.PK_POSOrder,
                VariationID=line_data.VariationID,
                Quantity=line_data.Quantity,
                Unit_Price=line_data.Unit_Price,
                Price=line_total,
                Status="pending",
                Creation_date=datetime.now(),
            )
            self.db.add(order_line)

            # Update variation quantity
            variation = self.db.query(Variation).filter(Variation.PK_Variation == line_data.VariationID).first()
            if variation:
                variation.Quantity -= line_data.Quantity
                variation.Sold += line_data.Quantity

        self.db.commit()
        self.db.refresh(db_order)
        return db_order

    def update_order(self, order_id: int, order_data: OrderUpdate):
        order = self.db.query(POSOrder).filter(POSOrder.PK_POSOrder == order_id).first()
        if not order:
            return None

        # Prevent any updates if order is cancelled or completed
        if order.Status and order.Status.upper() in ["CANCELLED", "COMPLETED"]:
            raise ValueError(f"Cannot update order with status '{order.Status}'. Order is already finalized.")

        for key, value in order_data.dict(exclude_unset=True).items():
            setattr(order, key, value)

        self.db.commit()
        self.db.refresh(order)
        return order

    def cancel_order(self, order_id: int):
        """Cancel order and restore inventory"""
        order = self.db.query(POSOrder).filter(POSOrder.PK_POSOrder == order_id).first()
        if not order or order.Status.upper() in ["CANCELLED", "COMPLETED"]:
            return None

        # Restore inventory
        order_lines = self.db.query(OrderLine).filter(OrderLine.OrderID == order_id).all()
        for line in order_lines:
            if line.VariationID:
                variation = self.db.query(Variation).filter(Variation.PK_Variation == line.VariationID).first()
                if variation:
                    variation.Quantity += line.Quantity
                    variation.Sold -= line.Quantity
            line.Status = "CANCELLED"
        order.Status = "CANCELLED"
        self.db.commit()
        self.db.refresh(order)
        return order

    def get_order_lines(self, order_id: int):
        order_lines = self.db.query(OrderLine).filter(OrderLine.OrderID == order_id).all()
        result = []
        for line in order_lines:
            variation_name = None
            if line.VariationID:
                variation = self.db.query(Variation).filter(Variation.PK_Variation == line.VariationID).first()
                if variation:
                    variation_name = variation.Name
            # Use mapped attribute names, not column names
            line_dict = {
                'PK_OrderLine': line.PK_OrderLine,
                'OrderID': line.OrderID,
                'VariationID': line.VariationID,
                'Quantity': line.Quantity,
                'Unit_Price': line.Unit_Price,
                'Price': line.Price,
                'Status': line.Status,
                'Creation_date': line.Creation_date,
                'VariationName': variation_name,
            }
            result.append(line_dict)
        return result

    def get_order_statistics(self, start_date: datetime = None, end_date: datetime = None):
        """Get order statistics for reporting"""
        query = self.db.query(POSOrder)

        if start_date:
            query = query.filter(POSOrder.Order_Date >= start_date)
        if end_date:
            query = query.filter(POSOrder.Order_Date <= end_date)

        orders = query.all()

        total_orders = len(orders)
        total_revenue = sum(order.Total_Amount for order in orders if order.Status != "CANCELLED")
        completed_orders = len([o for o in orders if o.Status == "COMPLETED"])

        return {
            "total_orders": total_orders,
            "total_revenue": float(total_revenue),
            "completed_orders": completed_orders,
            "cancelled_orders": total_orders - completed_orders,
        }
