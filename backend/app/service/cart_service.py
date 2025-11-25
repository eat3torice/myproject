from sqlalchemy.orm import Session

from app.model.cart_variation_model import CartVariation
from app.model.cartitem_model import CartItem
from app.model.variation_model import Variation
from app.schema.cart_schema import CartItemAdd


class CartService:
    def __init__(self, db: Session):
        self.db = db

    def get_cart_items(self, customer_id: int):
        """Lấy tất cả items trong giỏ hàng của customer"""
        return self.db.query(CartItem).filter(CartItem.Customer_id == customer_id, CartItem.Status == "active").all()

    def add_to_cart(self, customer_id: int, item_data: CartItemAdd):
        """Thêm sản phẩm vào giỏ hàng"""
        # Check if variation exists and has stock
        variation = self.db.query(Variation).filter(Variation.PK_Variation == item_data.variation_id).first()

        if not variation:
            raise ValueError("Product variation not found")

        if variation.Quantity < item_data.quantity:
            raise ValueError("Not enough stock")

        # Check if item already in cart
        existing_cart_item = (
            self.db.query(CartItem)
            .filter(CartItem.Customer_id == customer_id, CartItem.Status == "active")
            .join(CartVariation)
            .filter(CartVariation.VariationID == item_data.variation_id)
            .first()
        )

        if existing_cart_item:
            # Update quantity
            existing_cart_item.Quantity += item_data.quantity
            self.db.commit()
            self.db.refresh(existing_cart_item)
            return existing_cart_item
        else:
            # Create new cart item
            cart_item = CartItem(Customer_id=customer_id, Quantity=item_data.quantity, Status="active")
            self.db.add(cart_item)
            self.db.flush()

            # Create cart_variation mapping
            cart_var = CartVariation(CartItemID=cart_item.PK_CartItem, VariationID=item_data.variation_id)
            self.db.add(cart_var)
            self.db.commit()
            self.db.refresh(cart_item)
            return cart_item

    def update_cart_item(self, cart_item_id: int, customer_id: int, quantity: int):
        """Cập nhật số lượng trong giỏ hàng, kiểm tra tồn kho"""
        cart_item = (
            self.db.query(CartItem)
            .filter(CartItem.PK_CartItem == cart_item_id, CartItem.Customer_id == customer_id)
            .first()
        )

        if not cart_item:
            return None

        # Lấy variation từ cart_variation
        cart_var = self.db.query(CartVariation).filter(CartVariation.CartItemID == cart_item_id).first()
        if not cart_var:
            return None
        variation = self.db.query(Variation).filter(Variation.PK_Variation == cart_var.VariationID).first()
        if not variation:
            return None

        if quantity > variation.Quantity:
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail="Not enough stock")

        if quantity <= 0:
            self.db.delete(cart_item)
        else:
            cart_item.Quantity = quantity

        self.db.commit()
        return cart_item

    def remove_from_cart(self, cart_item_id: int, customer_id: int):
        """Xóa sản phẩm khỏi giỏ hàng"""
        cart_item = (
            self.db.query(CartItem)
            .filter(CartItem.PK_CartItem == cart_item_id, CartItem.Customer_id == customer_id)
            .first()
        )

        if not cart_item:
            return False

        self.db.delete(cart_item)
        self.db.commit()
        return True

    def clear_cart(self, customer_id: int):
        """Xóa toàn bộ giỏ hàng"""
        self.db.query(CartItem).filter(CartItem.Customer_id == customer_id).delete()
        self.db.commit()
        return True
