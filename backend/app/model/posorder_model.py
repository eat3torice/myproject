from sqlalchemy import TIMESTAMP, Column, ForeignKey, Integer, Numeric, String, Text

from app.database.base_class import Base


class POSOrder(Base):
    __tablename__ = "posorder"

    PK_POSOrder = Column("pk_posorder", Integer, primary_key=True, index=True)
    CustomerID = Column("customerid", Integer, ForeignKey("customer.pk_customer"))
    EmployeeID = Column("employeeid", Integer, ForeignKey("employee.pk_employee"))
    Creation_date = Column("creation_date", TIMESTAMP)
    Total_Amount = Column("total_amount", Numeric(12, 2))
    Total_Payment = Column("total_payment", Numeric(12, 2))
    PaymentMethodID = Column("paymentmethodid", Integer, ForeignKey("paymentmethod.pk_paymentmethod"))
    Note = Column("note", Text)
    Status = Column("status", String(50))
    Order_Date = Column("order_date", TIMESTAMP)
    Payment_Date = Column("payment_date", TIMESTAMP)
    Type_Order = Column("type_order", String(50))
