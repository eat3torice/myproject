from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_account
from app.database.session import get_db
from app.schema.cart_schema import CartItemAdd, CartItemResponse, CartItemUpdate
from app.service.cart_service import CartService
from app.service.user_service import UserService

router = APIRouter(prefix="/cart", tags=["User - Cart"])


def get_current_customer_id(current_account=Depends(get_current_account), db: Session = Depends(get_db)):
    """Helper để lấy customer_id từ account hiện tại"""
    user_service = UserService(db)
    customer = user_service.get_user_profile(current_account.PK_Account)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer profile not found")
    return customer.PK_Customer


@router.get("/", response_model=List[CartItemResponse])
def get_cart(customer_id: int = Depends(get_current_customer_id), db: Session = Depends(get_db)):
    """Lấy giỏ hàng của user"""
    service = CartService(db)
    items = service.get_cart_items(customer_id)

    # Populate variation info
    from app.model.cart_variation_model import CartVariation
    from app.model.variation_model import Variation

    result = []
    for item in items:
        cart_var = db.query(CartVariation).filter(CartVariation.CartItemID == item.PK_CartItem).first()
        if cart_var:
            variation = db.query(Variation).filter(Variation.PK_Variation == cart_var.VariationID).first()
            item_dict = {
                "PK_CartItem": item.PK_CartItem,
                "Customer_id": item.Customer_id,
                "VariationID": cart_var.VariationID,
                "Quantity": item.Quantity,
                "Status": item.Status,
                "variation_name": variation.Name if variation else "Unknown",
                "Price": float(variation.Price) if variation else 0,
            }
            result.append(item_dict)

    return result


@router.post("/", response_model=CartItemResponse)
def add_to_cart(item: CartItemAdd, customer_id: int = Depends(get_current_customer_id), db: Session = Depends(get_db)):
    """Thêm sản phẩm vào giỏ hàng"""
    service = CartService(db)
    try:
        cart_item = service.add_to_cart(customer_id, item)

        # Get variation info
        from app.model.cart_variation_model import CartVariation
        from app.model.variation_model import Variation

        cart_var = db.query(CartVariation).filter(CartVariation.CartItemID == cart_item.PK_CartItem).first()
        variation = db.query(Variation).filter(Variation.PK_Variation == cart_var.VariationID).first()

        return {
            "PK_CartItem": cart_item.PK_CartItem,
            "Customer_id": cart_item.Customer_id,
            "VariationID": cart_var.VariationID,
            "Quantity": cart_item.Quantity,
            "Status": cart_item.Status,
            "variation_name": variation.Name if variation else "Unknown",
            "Price": float(variation.Price) if variation else 0,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{cart_item_id}", response_model=CartItemResponse)
def update_cart_item(
    cart_item_id: int,
    item: CartItemUpdate,
    customer_id: int = Depends(get_current_customer_id),
    db: Session = Depends(get_db),
):
    """Cập nhật số lượng trong giỏ hàng"""
    service = CartService(db)
    cart_item = service.update_cart_item(cart_item_id, customer_id, item.quantity)
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")

    # Get variation info
    from app.model.cart_variation_model import CartVariation
    from app.model.variation_model import Variation

    cart_var = db.query(CartVariation).filter(CartVariation.CartItemID == cart_item.PK_CartItem).first()
    if not cart_var:
        raise HTTPException(status_code=404, detail="Cart variation not found")

    variation = db.query(Variation).filter(Variation.PK_Variation == cart_var.VariationID).first()

    return {
        "PK_CartItem": cart_item.PK_CartItem,
        "Customer_id": cart_item.Customer_id,
        "VariationID": cart_var.VariationID,
        "Quantity": cart_item.Quantity,
        "Status": cart_item.Status,
        "variation_name": variation.Name if variation else "Unknown",
        "Price": float(variation.Price) if variation else 0,
    }


@router.delete("/{cart_item_id}")
def remove_from_cart(
    cart_item_id: int, customer_id: int = Depends(get_current_customer_id), db: Session = Depends(get_db)
):
    """Xóa sản phẩm khỏi giỏ hàng"""
    service = CartService(db)
    success = service.remove_from_cart(cart_item_id, customer_id)
    if not success:
        raise HTTPException(status_code=404, detail="Cart item not found")
    return {"message": "Item removed from cart"}


@router.delete("/")
def clear_cart(customer_id: int = Depends(get_current_customer_id), db: Session = Depends(get_db)):
    """Xóa toàn bộ giỏ hàng"""
    service = CartService(db)
    service.clear_cart(customer_id)
    return {"message": "Cart cleared successfully"}
