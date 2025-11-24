from datetime import datetime

from sqlalchemy.orm import Session

from app.model.customer_model import Customer
from app.schema.customer_schema import CustomerCreate, CustomerUpdate


class CustomerService:
    def __init__(self, db: Session):
        self.db = db

    def get_customers(self, skip: int = 0, limit: int = 100):
        return self.db.query(Customer).offset(skip).limit(limit).all()

    def get_customer_by_id(self, customer_id: int):
        return self.db.query(Customer).filter(Customer.PK_Customer == customer_id).first()

    def get_customer_by_account_id(self, account_id: int):
        return self.db.query(Customer).filter(Customer.AccountID == account_id).first()

    def create_customer(self, customer_data: CustomerCreate):
        db_customer = Customer(
            AccountID=customer_data.AccountID,
            Name=customer_data.Name,
            Address=customer_data.Address,
            Phone=customer_data.Phone,
            Note=customer_data.Note,
            Status=customer_data.Status,
            Creation_date=datetime.now(),
        )
        self.db.add(db_customer)
        self.db.commit()
        self.db.refresh(db_customer)
        return db_customer

    def update_customer(self, customer_id: int, customer_data: CustomerUpdate):
        customer = self.db.query(Customer).filter(Customer.PK_Customer == customer_id).first()
        if not customer:
            return None

        for key, value in customer_data.dict(exclude_unset=True).items():
            setattr(customer, key, value)

        customer.Edit_date = datetime.now()
        self.db.commit()
        self.db.refresh(customer)
        return customer

    def delete_customer(self, customer_id: int):
        customer = self.db.query(Customer).filter(Customer.PK_Customer == customer_id).first()
        if not customer:
            return None

        self.db.delete(customer)
        self.db.commit()
        return customer
