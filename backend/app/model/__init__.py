# Import toàn bộ model để SQLAlchemy nhận diện khi tạo bảng

from app.model.account_model import Account
from app.model.address_model import Address
from app.model.brand_model import Brand
from app.model.cart_variation_model import CartVariation
from app.model.cartitem_model import CartItem
from app.model.category_model import Category
from app.model.customer_model import Customer
from app.model.employee_model import Employee
from app.model.images_model import Images
from app.model.orderline_model import OrderLine
from app.model.paymentmethod_model import PaymentMethod
from app.model.posorder_model import POSOrder
from app.model.product_model import Product
from app.model.role_model import Role
from app.model.variation_model import Variation

__all__ = [
    "Role",
    "Account",
    "Address",
    "Employee",
    "Customer",
    "Brand",
    "Category",
    "Product",
    "Variation",
    "Images",
    "CartItem",
    "CartVariation",
    "PaymentMethod",
    "POSOrder",
    "OrderLine",
]
